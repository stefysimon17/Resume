import * as React from 'react';
import { IMenuButtonProps } from '../MenuButton.types';
import MenuButtonLink from './MenuButtonLink';

const EMPTY_STRING = '\u00A0';

type MenuButtonRootProps = Partial<IMenuButtonProps> & {
  children(label: string): React.ReactNode;
};

const MenuButtonRoot: React.FC<MenuButtonRootProps> = props => {
  const {
    label,
    direction = 'ltr',
    positionInList,
    parentId,
    dataId,
    isContainer,
    isSelected,
    isHovered,
    link,
    tagName: TagName = 'div',
    id,
    className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    index,
    children,
    isDropDownButton,
    isTouchDevice,
    subItems,
  } = props;

  // TODO: Improve this previous state polyfill until we're more familiar with the implications on the custom element
  const containerType = isContainer ? 'drop' : 'menu';
  const hasLink =
    link &&
    (link.hasOwnProperty('href') ||
      link.hasOwnProperty('target') ||
      link.hasOwnProperty('rel') ||
      link.hasOwnProperty('linkPopupId'));
  const state = [
    containerType,
    isSelected && 'selected',
    isHovered && 'over',
    hasLink ? 'link' : 'header',
  ];

  const dataAttributes = {
    'data-direction': direction,
    'data-listposition': positionInList,
    'data-parent-id': parentId,
    'data-data-id': dataId,
    'data-state': state.join(' '),
    'data-index': index,
    'data-dropdown': isDropDownButton,
  };

  const _getLabel = (_label?: string) =>
    _label ? _label.trim() : EMPTY_STRING;

  // for SEO purposes, render list of subitems, visible to bots only
  const subItemList =
    subItems && subItems.length ? (
      <ul aria-hidden={true} style={{ display: 'none' }}>
        {subItems.map((subItem, i) => (
          <li key={subItem.id || i}>
            <MenuButtonLink
              wrapperProps={{ ariaHasPopup: subItem.hasPopup }}
              link={subItem.link}
              tabIndex={-1}
            >
              {_getLabel(subItem.label)}
            </MenuButtonLink>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <TagName
      id={id}
      {...dataAttributes}
      className={className}
      onClick={isTouchDevice ? onClick : undefined}
      onMouseEnter={isTouchDevice ? undefined : onMouseEnter}
      onMouseLeave={isTouchDevice ? undefined : onMouseLeave}
      onFocus={isTouchDevice ? undefined : onMouseEnter}
      onBlur={isTouchDevice ? undefined : onMouseLeave}
    >
      {children(_getLabel(label))}
      {subItemList}
    </TagName>
  );
};

export default MenuButtonRoot;
