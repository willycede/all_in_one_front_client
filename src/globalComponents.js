/**
 * VueShop Global Components
 */
import HeaderV1 from './components/Layouts/Header/HeaderV1.vue';
import HeaderV2 from './components/Layouts/Header/HeaderV2.vue';
import HeaderV3 from './components/Layouts/Header/HeaderV3.vue';
import FixedHeader from './components/Layouts/Header/FixedHeader.vue';
import FooterV1 from './components/Layouts/Footer/FooterV1.vue';
import SocialShare from './components/Global/SocialShare';
import CurrencySign from './components/Global/CurrencySign';
import DeleteConfirmationDialog from './components/Global/DeleteConfirmationDialog';
import ConfirmationDialog from './views/components/DialogConfirmation';
import LoadComponent from './views/components/DialogMessajeProcess';
import GoogleMap from "./components/Global/GoogleMap";
import PageTitle from './components/Global/PageTitle';
import PageTitleShopping from './components/Global/PageTitleShopping';
import ReviewPopup from './components/Global/ReviewPopup';
import Sidebar from './components/Layouts/Sidebar/Sidebar';
import SidebarPanel from './components/Global/SidebarPanel';
import Timer from './components/Global/Timer';
import AppCard from 'Components/AppCard/AppCard';
import DeleteConfirmationDialog2 from './components/Global/DeleteConfirmationDialog2';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import AdminPageHeader from './components/Admin/AdminPageHeader.vue';


const GlobalComponents = {
   install(Vue) {
      Vue.component('embHeaderV1', HeaderV1);
      Vue.component('embHeaderV2', HeaderV2);
      Vue.component('embHeaderV3', HeaderV3);
      Vue.component('embFixedHeader', FixedHeader);
      Vue.component('embFooterV1', FooterV1);
      Vue.component('embSocialShare', SocialShare);
      Vue.component('embCurrencySign', CurrencySign);
      Vue.component('embDeleteConfirmation', DeleteConfirmationDialog);
      Vue.component('embConfirmationComponent', ConfirmationDialog);
      Vue.component('embLoadComponent', LoadComponent);
      Vue.component('embGoogleMap', GoogleMap);
      Vue.component('embPageTitle', PageTitle);
      Vue.component('embPageTitleShopping', PageTitleShopping);
      Vue.component('embReviewPopup', ReviewPopup);
      Vue.component('embSidebar', Sidebar);
      Vue.component('embSidebarPanel', SidebarPanel);
      Vue.component('embTimer', Timer);
      Vue.component('appCard', AppCard);
      Vue.component('embDeleteConfirmation2', DeleteConfirmationDialog2);
      Vue.component('embPerfectScrollbar', VuePerfectScrollbar);
      Vue.component('AdminPageHeader', AdminPageHeader);
   }
}

export default GlobalComponents