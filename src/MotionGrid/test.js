import React from 'react';
import { presets } from 'react-motion';
import Measure from 'react-measure';
import MotionGrid from './index';
import range from 'lodash/range';
import flatten from 'lodash/flatten';
import styled from 'styled-components';
import Square from './Square';

const Wrapper = styled.div`
`;

const AppShellItem = styled(Square)`
  background: #EEE;
`;

const Item = styled(Square)`
  background: #900;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadMoreButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LoadingMoreItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
`;

export default class Test extends React.Component {

  componentWillMount() {
    this.setState({
      items: [],
    });

    setTimeout(() => {
      this.setState({
        items: this.createItems(9),
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
          ...this.createItems(9, items.length),
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
          columns={flatten(range(5).map(i => ([
            4, 4, 4,
            3, 3, 3, 3,
            6, 6,
          ])))}
          innerPadding={{
            vertical: 12,
            horizontal: 12,
          }}
          enableAppShell
          enablePaging
          appShellItem={<AppShellItem />}
          pagingOptions={{
            isFetchedAll: items.length >= 30,
            isLoading: isLoading,
            loadMoreItems: () => this.loadMoreItems(items),
            renderLoadMoreButton: ({ onClick, disabled }) => (
              <LoadMoreButtonContainer>
                <Button onClick={onClick} disabled={disabled}>Click to Load more</Button>
              </LoadMoreButtonContainer>
            ),
            renderLoadingMoreItems: () => (
              <LoadingMoreItems>Loading more items...</LoadingMoreItems>
            ),
          }}
        >
          {items}
        </MotionGrid>
      </Wrapper>
    );
  }
}
