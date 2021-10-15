import * as React from 'react';
import { ContainerWrapperProps } from '../ContainerWrapper.types';

const ContainerWrapper: React.FC<ContainerWrapperProps> = ({
  id,
  children,
  tagName,
}) => {
  const SemanticElement = tagName as keyof JSX.IntrinsicElements;
  return (
    <SemanticElement tabIndex={-1} id={id}>
      {children()}
    </SemanticElement>
  );
};

export default ContainerWrapper;
