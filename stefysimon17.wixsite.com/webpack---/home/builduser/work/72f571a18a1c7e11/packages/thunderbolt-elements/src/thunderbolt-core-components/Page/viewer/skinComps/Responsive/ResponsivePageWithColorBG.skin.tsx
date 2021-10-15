import React from 'react';
import { SkinPageProps } from '../SkinPage';
import styles from './styles/ResponsivePageWithColorBG.scss';

const ResponsivePageWithColorBG: React.FC<SkinPageProps> = ({
  id,
  pageDidMount,
  onClick,
  onDblClick,
  children,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      id={id}
      className={styles.root}
      ref={pageDidMount}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.bg} />
      <div>{children()}</div>
    </div>
  );
};

export default ResponsivePageWithColorBG;
