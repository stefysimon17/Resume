import React from 'react';
import { SkinFiveGridLineProps } from '../SkinFiveGridLine';
import { FiveGridLineWrapper } from '../../FiveGridLineWrapper';
import skinsStyle from './SolidLine.scss';

const SolidLine: React.FC<SkinFiveGridLineProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
  ...rest
}) => {
  return <FiveGridLineWrapper {...rest} className={skinsStyle.root} />;
};

export default SolidLine;
