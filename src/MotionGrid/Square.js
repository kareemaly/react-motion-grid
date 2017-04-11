import React from 'react';
import Measure from 'react-measure';
import styled from 'styled-components';

const StyledBox = styled.div`
  height: ${(props) => props.height}px;
`;

export default ({ heightRatio = 1, ...props }) => (
  <Measure whitelist={['width']} includeMargin={false}>
    {({ width }) => (
      <StyledBox
        height={width * heightRatio}
        {...props}
      />
    )}
  </Measure>
);
