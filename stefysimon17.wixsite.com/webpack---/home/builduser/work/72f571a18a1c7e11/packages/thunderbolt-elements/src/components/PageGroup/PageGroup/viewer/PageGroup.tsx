import * as React from 'react';
import { ReactNode } from 'react';
import { IPageGroupProps } from '../PageGroup.types';
import GroupContent from '../../commons/viewer/GroupContent';
import style from './style/style.scss';

const GroupContentMemo = React.memo(GroupContent, (__, nextProps) => {
  return !(nextProps.children()! as Array<ReactNode>).length;
});

const PageGroup: React.FC<IPageGroupProps> = props => {
  const { children, ...restProps } = props;

  return (
    <div id="SITE_PAGES">
      <GroupContentMemo {...restProps} className={style.pageGroup}>
        {children}
      </GroupContentMemo>
    </div>
  );
};

export default PageGroup;
