import React from 'react';
import { presets } from 'react-motion';
import Measure from 'react-measure';
import MotionGrid from './index';
import range from 'lodash/range';
import styled from 'styled-components';
import Square from './Square';

const Wrapper = styled.div`
`;

const Item = styled(Square)`
  background: #900;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default class Test extends React.Component {

  componentWillMount() {
    this.setState({
      items: [],
    });

    setTimeout(() => {
      this.setState({
        items: this.createItems(12),
      });
    }, 3000);
  }

  createItems(no, startWith = 1) {
    return range(no).map((i) => (
      <Item>{i + startWith}</Item>
    ));
  }

  loadMoreItems = (items) => {
    this.setState({
      isLoading: true,
    });

    setTimeout(() => {
      this.setState({
        items: [
          ...items,
          ...this.createItems(12, items.length),
        ],
        isLoading: false,
      });
    }, 1000);
  }

  render() {
    const {
      items,
      isLoading,
    } = this.state;
    return (
      <Wrapper>
        <MotionGrid
          columns={[ 6, 6, 4, 4, 4, 12 ]}
          innerPadding={{
            vertical: 10,
            horizontal: 24,
          }}
          enableAppShell
          enablePaging
          pagingOptions={{
            isFetchedAll: true,
            isLoading: isLoading,
            loadMoreItems: () => this.loadMoreItems(items),
          }}
        >
          {items}
        </MotionGrid>
      </Wrapper>
    );
  }
}
