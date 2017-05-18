import React from 'react'
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { StaggeredMotion, spring, presets } from 'react-motion';
import styled from 'styled-components';
import keys from 'lodash/keys';
import bottomFadeIn from './BottomFadeInAnimation';
import fadeIn from './FadeInAnimation';

const animations = {
  bottomFadeIn,
  fadeIn,
};

const getHorizontalPadding = (innerPadding) => {
  return isNaN(innerPadding.horizontal) ? (innerPadding || 0) : innerPadding.horizontal;
}

const getVerticalPadding = (innerPadding) => {
  return isNaN(innerPadding.vertical) ? (innerPadding || 0) : innerPadding.vertical;
}

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  box-sizing: content-box;
`;

const Column = styled.div`
  width: ${(props) => (props.width * 100) / 12}%;
  margin-top: ${(props) => props.padding.top || 0}px;
  margin-bottom: ${(props) => props.padding.bottom || 0}px;
  padding-left: ${(props) => props.padding.left || 0}px;
  padding-right: ${(props) => props.padding.right || 0}px;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const PatchWrapper = styled.div`
  ${(props) => props.isFirst && `
    margin-top: -${getVerticalPadding(props.innerPadding)/2}px;
  `}
  ${(props) => props.isLast && `
    margin-bottom: -${getVerticalPadding(props.innerPadding)/2}px;
  `}
  width: 100%;
`;

export default class MotionGrid extends React.Component {
  static propTypes = {
    /**
     * Array of react elements you want to render in a grid.
     */
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    /**
     * This controls number of columns to render for each row.
     * This **MUST** be between 1 and 12
     * e.g. `12 / 3` -> This will render 3 columns in each row.
     * e.g. `[ 6, 6, 4, 4, 4 ]` -> This will render 5 items in two rows, first 
     * row will render two items (6, 6), second row will render three items
     * (4, 4, 4).
     */
    columns: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    /**
     * Inner paddings between items. You can have different vertical and horizontal
     * paddings.
     */
    innerPadding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({
        vertical: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        horizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
    ]),
    /**
     * If you want to control when the animation should start then set this to
     * false.
     */
    startAnimate: PropTypes.bool,
    /**
     * Animation type to use.
     */
    animationType: PropTypes.oneOf([
      'bottomFadeIn',
      'fadeIn',
    ]),
    /**
     * This will disable the animation.
     */
    disableAnimation: PropTypes.bool,
    /**
     * Enable paging feature.
     */
    enablePaging: PropTypes.bool,
    /**
     * This is only considered when enablePaging is true.
     */
    pagingOptions: PropTypes.shape({
      isFetchedAll: PropTypes.bool,
      isLoading: PropTypes.bool,
      loadMoreItems: PropTypes.func,
    }),
    /**
     * React motion configurations.
     * [More about this here](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig)
     */
    springOptions: PropTypes.shape({
      stiffness: PropTypes.number,
      damping: PropTypes.number,
    }),
    /**
     * Whether or not to enable placeholders.
     */
    enablePlaceholders: PropTypes.bool,
    /**
     * Number of placeholder rows to show before data is loaded
     */
    placeholderRows: PropTypes.number,
    /**
     * React element to render for the placeholder
     */
    placeholderItem: PropTypes.element,
    /**
     * Minimum millis to wait before hiding placeholder even if the data was loaded.
     * This is used to pervent flickers when the data is loaded in a very short time
     */
    minimumPlaceholdersTime: PropTypes.number,
  };

  static defaultProps = {
    columns: 12,
    innerPadding: 0,
    startAnimate: true,
    enablePaging: false,
    enablePlaceholders: false,
    pagingOptions: {},
    springOptions: presets.noWobble,
    placeholderRows: 3,
    animationType: 'fadeIn',
    minimumPlaceholdersTime: 0,
  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentWillMount() {
    const hasMinimumPlaceholdersTime = this.props.enablePlaceholders && this.props.minimumPlaceholdersTime > 0;

    this.setState({
      animationOnRest: false,
      isLoadBtnClicked: false,
      // Add first patch
      patches: this.props.children.length > 0 ? [this.props.children] : [],
      // Force show placeholder if minimum placeholder time was greater than zero
      forceShowPlaceholders: hasMinimumPlaceholdersTime,
    });

    // Add timer to unset forceShowPlaceholders state variable after the minimum placeholder time
    if(hasMinimumPlaceholdersTime) {
      this.timer = setTimeout(() => {
        this.setState({
          forceShowPlaceholders: false,
        });
      }, this.props.minimumPlaceholdersTime);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.children.length > this.props.children.length) {
      this.setState({
        patches: [
          ...this.state.patches,
          nextProps.children.slice(this.props.children.length),
        ],
      })
    } else if(nextProps.children.length < this.props.children.length) {
      this.setState({
        patches: [
          // @todo can we do anything about this ??
          nextProps.children,
        ],
      });
    }
  }

  getRows(patch, columns) {
    let rows = [], rowLength = 0;
    const length = columns.length || patch.length;

    for (let i = 0; i < length; i++) {
      const columnWidth = columns[i] || columns;
      if (rowLength <= 0) {
        rowLength = 12;
        rows.push([]);
      }

      rows[rows.length - 1].push({
        element: patch[i],
        width: columnWidth,
      });
      rowLength = rowLength - columnWidth;
    }

    return rows;
  }

  isVisible({ opacity }) {
    return opacity > 0.1;
  }

  renderRows({ rows, animation, innerPadding, styles, isPlaceholders = false }) {
    let k = 0;

    // @todo remove this when react-motion implements onRest for StaggeredMotion...
    if(!isPlaceholders && ! styles.some(style => style.opacity < 1) && !this.animationOnRest) {
      this.animationOnRest = true;
      setTimeout(() => this.setState({ animationOnRest: true }), 100);
    }

    return rows.map((columns, i, rows) => {
      const horizontalPadding = getHorizontalPadding(innerPadding);
      const verticalPadding = getVerticalPadding(innerPadding);
      return (
        <div key={i} style={{ overflow: 'hidden' }}>
          <Row
            style={{
              marginLeft: -horizontalPadding/2,
              marginRight: -horizontalPadding/2,
            }}>
            {columns.map((column, j) => {
              const columnStyle = styles[k++] || {};
              const isFirstOne = j === 0;
              const isLastOne = (12 / column.width) === j + 1;

              const left = ((horizontalPadding)/2);
              const right = ((horizontalPadding)/2);

              const top = ((verticalPadding)/2);
              const bottom = ((verticalPadding)/2);

              if(column.element && (!animation || animation.isVisible(columnStyle))) {
                return (
                  <Column
                    padding={{ top, bottom, left, right, }}
                    width={column.width}
                    key={j}
                  >
                    {animation ? animation.getWrapper(column.element, columnStyle) : column.element}
                  </Column>
                );
              }
            }).filter(ele => !!ele)}
          </Row>
        </div>
      )
    });
  }

  renderPatch({
    isFirst,
    isLast,
    patch,
    animation,
    columns,
    startAnimate,
    springOptions,
    innerPadding,
  }, index) {
    const rows = this.getRows(patch, columns);

    if (rows.length == 0) {
      return <div></div>;
    }

    if (this.props.disableAnimation) {
      return (
        <PatchWrapper key={index} innerPadding={innerPadding}>
          {this.renderRows({
            rows,
            innerPadding,
            styles: new Array(patch.length).fill({
              opacity: 1,
              translateX: 0,
            }),
          })}
        </PatchWrapper>
      );
    }

    return (
      <StaggeredMotion
        key={index}
        defaultStyles={animation.getInitialStyles(patch)}
        styles={(prevFrameStyles) => animation.calculateNextFrame({
          startAnimate,
          prevFrameStyles,
        })}>
        {styles => (
          <PatchWrapper innerPadding={innerPadding}>
            {this.renderRows({
              rows,
              innerPadding,
              styles,
              animation,
            })}
          </PatchWrapper>
        )}
      </StaggeredMotion>
    )
  }

  renderPatches({ patches, ...args }) {
    return patches.map((patch, index) =>
      this.renderPatch({
        isFirst: index === 0,
        isLast: index === patches.length - 1,
        patch,
        ...args,
      }, index));
  }

  getNumberOfShellItems({ columns, placeholderRows }) {
    if(!isNaN(columns)) {
      return Math.floor((12 / columns) * placeholderRows);
    }

    //
    let addition = 0;
    for (var i = 0; i < columns.length; i++) {
      if(addition >= (placeholderRows * 12)) {
        return i ;
      } else {
        addition = columns[i] + addition;
      }
    }
  }

  renderPlaceholders({ columns, placeholderItem, placeholderRows, innerPadding }) {
    const noOfShellItems = this.getNumberOfShellItems({ columns, placeholderRows });
    const patch = new Array(noOfShellItems).fill(placeholderItem);
    const rows = this.getRows(patch, columns);
    return (
      <PatchWrapper innerPadding={innerPadding}>
        {this.renderRows({
          rows,
          innerPadding,
          styles: new Array(patch.length).fill({
            opacity: 1,
            translateX: 0,
          }),
          isPlaceholders: true,
        })}
      </PatchWrapper>
    );
  }

  renderWaypoint({ pagingOptions }) {
    if(! pagingOptions.loadMoreItems) {
      return null;
    }

    if(pagingOptions.isLoading) {
      return pagingOptions.renderLoadingMoreItems();
    }

    return (
      <Waypoint
        onEnter={() => {
          if(! pagingOptions.isLoading) {
            pagingOptions.loadMoreItems();
          }
        }}
      />
    );
  }

  renderPagingBehaviour({ enablePaging, pagingOptions, isLoadBtnClicked, animationOnRest }) {
    if (! enablePaging || pagingOptions.isFetchedAll || !animationOnRest) return;

    if (!isLoadBtnClicked && pagingOptions.loadMoreItems) {
      const onClick = () => {
        pagingOptions.loadMoreItems();
        this.setState({ isLoadBtnClicked: true });
      };

      return pagingOptions.renderLoadMoreButton({
        disabled: pagingOptions.isLoading,
        onClick,
      });
    } else {
      return this.renderWaypoint({ pagingOptions });
    }
  }

  render() {
    const {
      columns,
      innerPadding,
      startAnimate,
      springOptions,
      enablePaging,
      pagingOptions,
      enablePlaceholders,
      placeholderRows,
      placeholderItem,
      animationType,
      minimumPlaceholdersTime,
      children,
      ...props,
    } = this.props;

    const {
      patches,
      isLoadBtnClicked,
      animationOnRest,
      forceShowPlaceholders,
    } = this.state;

    const isDataLoaded = children.length > 0;

    if(enablePlaceholders && (!isDataLoaded || forceShowPlaceholders)) {
      return this.renderPlaceholders({ columns, placeholderItem, innerPadding, placeholderRows });
    }

    const animation = new animations[animationType];

    return (
      <div {...props}>
        {this.renderPatches({ patches, animation, columns, startAnimate, springOptions, innerPadding })}
        {this.renderPagingBehaviour({ enablePaging, pagingOptions, isLoadBtnClicked, animationOnRest })}
      </div>
    );
  }
}
