import DropDownMenu_TextOnlyMenuButtonSkinComponent from '@wix/thunderbolt-elements/src/components/DropDownMenu/viewer/skinComps/TextOnlyMenuButtonSkin/TextOnlyMenuButtonSkin.skin';
import Page_ResponsivePageWithColorBGComponent from '@wix/thunderbolt-elements/src/thunderbolt-core-components/Page/viewer/skinComps/Responsive/ResponsivePageWithColorBG.skin';
import ResponsiveContainerComponent from '@wix/thunderbolt-elements/src/thunderbolt-core-components/ResponsiveContainer/viewer/ResponsiveContainer';


const DropDownMenu_TextOnlyMenuButtonSkin = {
  component: DropDownMenu_TextOnlyMenuButtonSkinComponent
};

const Page_ResponsivePageWithColorBG = {
  component: Page_ResponsivePageWithColorBGComponent
};

const ResponsiveContainer = {
  component: ResponsiveContainerComponent
};


export const components = {
  ['DropDownMenu_TextOnlyMenuButtonSkin']: DropDownMenu_TextOnlyMenuButtonSkin,
  ['Page_ResponsivePageWithColorBG']: Page_ResponsivePageWithColorBG,
  ['ResponsiveContainer']: ResponsiveContainer
};


// temporary export
export const version = "1.0.0"
