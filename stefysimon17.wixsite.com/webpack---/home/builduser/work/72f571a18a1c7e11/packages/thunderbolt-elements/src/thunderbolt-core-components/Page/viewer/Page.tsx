import * as React from 'react';
import { PageProps } from '../Page.types';

const Page: React.FC<PageProps> = ({
  id,
  skin: PageClass,
  pageDidMount,
  onClick = () => {},
  onDblClick = () => {},
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  return (
    <PageClass
      id={id}
      pageDidMount={pageDidMount}
      onClick={onClick}
      onDblClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children as () => React.ReactNode}
    </PageClass>
  );
};

export default Page;
