import React from 'react';
import { spring } from 'react-motion';
import styled from 'styled-components';

const ItemWrapper = styled.div`
  opacity: ${(props) => props.opacity};
`;

export default class FadeInAnimation {

  getWrapper(children, { opacity }) {
    return (
      <ItemWrapper
        opacity={opacity}
      >
        {children}
      </ItemWrapper>
    );
  }

  getInitialStyles(styles) {
    return styles.map(() => ({
      opacity: 0,
    }));
  }

  calculateNextFrame = ({ startAnimate, springOptions, prevFrameStyles }) => {
    if (!startAnimate) {
      return this.getInitialStyles(prevFrameStyles);
    }

    return prevFrameStyles.map((_, index) => {
      if (index === 0) {
        return {
          opacity: spring(1, springOptions),
        };
      }
      else if(prevFrameStyles[index - 1].opacity < 0.4)
      {
        return prevFrameStyles[index];
      }
      else {
        return {
          opacity: spring(prevFrameStyles[index - 1].opacity, springOptions),
        };
      }
    });
  }

}
