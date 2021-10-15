import * as React from 'react';
import { IPagesContainerProps } from '../PagesContainer.types';

const PagesContainer: React.FC<IPagesContainerProps> = ({ children }) => {
  return (
    <main id="PAGES_CONTAINER" tabIndex={-1}>
      {children()}
    </main>
  );
};

export default PagesContainer;
