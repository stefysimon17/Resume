import React, { ReactNode } from 'react';
import { IBackgroundGroupProps } from '../BackgroundGroup.types';
import GroupContent from '../../commons/viewer/GroupContent';

const GroupContentMemo = React.memo(GroupContent, (__, nextProps) => {
  return !(nextProps.children()! as Array<ReactNode>).length;
});

const BackgroundGroup: React.FC<IBackgroundGroupProps> = props => {
  const { children, ...restProps } = props;
  return (
    <div id="BACKGROUND_GROUP">
      <GroupContentMemo {...restProps}>{children}</GroupContentMemo>
    </div>
  );
};

export default BackgroundGroup;
