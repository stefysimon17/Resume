import * as React from 'react';
import classNamesFn from 'classnames';
import { IMasterPageProps } from '../MasterPage.types';

const MasterPage: React.FC<IMasterPageProps> = ({
  classNames = {},
  pageDidMount,
  children,
}) => {
  const wrapperClasses = classNamesFn(Object.values(classNames));

  return (
    <div id="masterPage" className={wrapperClasses} ref={pageDidMount}>
      {children()}
    </div>
  );
};

export default MasterPage;
