import {
  DefaultCompPlatformProps,
  DefaultContainerProps,
} from '@wix/editor-elements-types';
import React, { ReactElement } from 'react';
import { TestIds } from '../constants';

export type MeshContainerProps = DefaultCompPlatformProps &
  DefaultContainerProps & {
    wedges?: Array<string>;
    rotatedComponents?: Array<string>;
    fixedComponents?: Array<string>;
    extraClassName?: string;
  };

const REPEATER_DELIMITER = '__';

const getTemplateId = (comp: ReactElement) =>
  comp.props.id.split(REPEATER_DELIMITER)[0];

const renderRotatedComponents = (child: ReactElement) => (
  <div
    key={`${child.props.id}-rotated-wrapper`}
    data-mesh-id={`${child.props.id}-rotated-wrapper`}
  >
    {child}
  </div>
);
type RenderChildrenProps = {
  wedges: Array<string>;
  rotatedComponents: Array<string>;
  childrenArray: Array<React.ReactNode>;
};

const renderChildren = (props: RenderChildrenProps) => {
  const { wedges, rotatedComponents, childrenArray } = props;
  const rotatedComponentsSet: Record<string, boolean> =
    rotatedComponents.reduce(
      (acc, rotatedComponent) => ({ ...acc, [rotatedComponent]: true }),
      {},
    );

  const renderedRotatedComponents = childrenArray.map(child =>
    rotatedComponentsSet[getTemplateId(child as React.ReactElement)]
      ? renderRotatedComponents(child as React.ReactElement)
      : child,
  );
  const renderedWedges = wedges.map(wedge => (
    <div key={wedge} data-mesh-id={wedge} />
  ));

  return [...renderedRotatedComponents, ...renderedWedges];
};

const MeshContainer: React.ComponentType<MeshContainerProps> = ({
  id,
  wedges = [],
  rotatedComponents = [],
  children,
  fixedComponents = [],
  extraClassName = '',
}) => {
  const childrenArray = React.Children.toArray(children());

  const fixedChildren: Array<React.ReactNode> = [];
  const nonFixedChildren: Array<React.ReactNode> = [];

  childrenArray.forEach(comp =>
    fixedComponents.includes((comp as React.ReactElement).props.id)
      ? fixedChildren.push(comp)
      : nonFixedChildren.push(comp),
  );

  const meshChildren = renderChildren({
    childrenArray: nonFixedChildren,
    rotatedComponents,
    wedges,
  });

  return (
    <div
      data-mesh-id={`${id}inlineContent`}
      data-testid={TestIds.inlineContent}
      className={extraClassName}
    >
      <div
        data-mesh-id={`${id}inlineContent-gridContainer`}
        data-testid={TestIds.content}
      >
        {meshChildren}
      </div>
      {fixedChildren}
    </div>
  );
};

export default MeshContainer;
