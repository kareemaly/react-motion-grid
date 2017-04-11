import React from 'react'
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { StaggeredMotion, spring, presets } from 'react-motion';
import styled from 'styled-components';
import Square from './Square';
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

const Button = styled.button`
`;

const PatchWrapper = styled.div`
  margin-top: -${(props) => getVerticalPadding(props.innerPadding)/2}px;
  margin-bottom: -${(props) => getVerticalPadding(props.innerPadding)/2}px;
  width: 100%;
`;

const PatchAppShellItem = styled(Square)`
  background: #EEE;
`;

const LoadingMoreItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LoadMoreButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const GRID_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default class MotionGrid extends React.Component {
  static propTypes = {
    disableAnimation: PropTypes.bool,
    columns: PropTypes.oneOfType([
      PropTypes.oneOf(GRID_COLUMNS),
      PropTypes.arrayOf(PropTypes.oneOf(GRID_COLUMNS)),
    ]),
    innerPadding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({
        vertical: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        horizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
    ]),
    startAnimate: PropTypes.bool,
    enablePaging: PropTypes.bool,
    pagingOptions: PropTypes.shape({
      isFetchedAll: PropTypes.bool,
      isLoading: PropTypes.bool,
      loadMoreItems: PropTypes.func,
    }),
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    springOptions: PropTypes.shape({
      stiffness: PropTypes.number,
      damping: PropTypes.number,
    }),
    shellItemsRows: PropTypes.number,
    animationType: PropTypes.oneOf(keys(animations)),
  };

  static defaultProps = {
    columns: 12,
    innerPadding: 0,
    startAnimate: true,
    enablePaging: false,
    pagingOptions: {},
    springOptions: presets.noWobble,
    shellItemsRows: 3,
    animationType: 'fadeIn',
  };

  componentWillUnmount() {
    this.unmounted = true;
  }

  componentWillMount() {
    this.setState({
      animationOnRest: false,
      isLoadBtnClicked: false,
      // Add first patch
      patches: this.props.children.length > 0 ? [this.props.children] : [],
    });
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

  renderRows({ rows, animation, innerPadding, styles, isAppShell = false }) {
    let k = 0;

    // @todo remove this when react-motion implements onRest for StaggeredMotion...
    if(!isAppShell && ! styles.some(style => style.opacity < 1) && !this.animationOnRest) {
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

              return (
                <Column
                  padding={{ top, bottom, left, right, }}
                  width={column.width}
                  key={j}
                >
                  {animation ? animation.getWrapper(column.element, columnStyle) : column.element}
                </Column>
              )
            })}
          </Row>
        </div>
      )
    });
  }

  renderPatch({ patch, animation, columns, startAnimate, springOptions, innerPadding }, index) {
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
      this.renderPatch({ patch, ...args }, index));
  }

  renderAppShell({ columns, shellItemsRows, innerPadding }) {
    const noOfShellItems = columns.length || Math.floor((12 / columns) * shellItemsRows);
    const patch = new Array(noOfShellItems).fill(
      <PatchAppShellItem />
    );
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
          isAppShell: true,
        })}
      </PatchWrapper>
    );
  }

  renderWaypoint({ pagingOptions }) {
    if(! pagingOptions.loadMoreItems) {
      return null;
    }

    if(pagingOptions.isLoading) {
      return <LoadingMoreItems>Loading more items...</LoadingMoreItems>;
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
      return (
        <LoadMoreButtonContainer>
          <Button
            onClick={() => {
              pagingOptions.loadMoreItems();
              this.setState({ isLoadBtnClicked: true });
            }}
            disabled={pagingOptions.isLoading}
          >
            Load more
          </Button>
        </LoadMoreButtonContainer>
      );
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
      enableAppShell,
      shellItemsRows,
      animationType,
      children,
      ...props,
    } = this.props;

    const {
      patches,
      isLoadBtnClicked,
      animationOnRest,
    } = this.state;

    if(enableAppShell && children.length === 0) {
      return this.renderAppShell({ columns, innerPadding, shellItemsRows });
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
