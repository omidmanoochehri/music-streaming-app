import Live from "../pages/Live"
import Categories from "../pages/Categories";
import Search from "../pages/Search/Search";
import Profile from "../pages/Profile";
import PodcastsList from "../pages/PodcastsList"
import Podcast from "../pages/Podcast"
import NotFound from "../pages/NotFound";
import Master from '../containers';


const routes = [
    {
        path: '/',
        exact: true,
        Component: Live,
        Master
    },
    {
        path: '/categories',
        exact: true,
        Component: Categories,
        Master
    },
    {
        path: '/search',
        exact: true,
        Component: Search,
        Master
    },
    {
        path: '/profile',
        exact: true,
        Component: Profile,
        Master
    },
    {
        path: '/podcastsList',
        exact: true,
        Component: PodcastsList,
        Master
    },
    {
        path: '/podcast',
        exact: true,
        Component: Podcast,
        Master
    },
    {
        exact: true,
        Component: NotFound
    }
];

export default routes;