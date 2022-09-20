import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Link, RouteProps } from 'react-router-dom';
import GamePage from './pages/GamePage';
import LandingPage from './pages/LandingPage';
import ErrorPage from './pages/ErrorPage';
// import { RouteComponentProps } from 'react-router';

enum PageState {
  UNKNOWN,
  LOADING,
  GAME,
}

export default function App() {
  return (
    <div>
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path={`/:uuid`} element={<GamePage />} />

        {/* Using path="*"" means "match anything", so this route
      acts like a catch-all for URLs that we don't have explicit
      routes for. */}

        <Route path="/" element={<LandingPage />} />
        {/* <Route path="*" element={<ErrorPage />} /> */}
      </Routes>
    </div>
  );
}

// const RouteUuid = (props: RouteComponentProps) => {
//   const [uuidType, setUuidType] = useState<number>(PageState.GAME);
//   const pathname = props.location.pathname.slice(1);

//   // useEffect(() => {
//   //   __genFetchUuid({pathname, setUuidType});
//   // }, [pathname]);

//   return (
//     <Route {...props} />
//   );
// };

// const __genFetchUuid = async ({pathname, setUuidType}) => {
//   try {
//     const response = await FeedDataService.getUuidType({uuid: pathname});
//     const {data} = response;
//     if (data) {
//       setUuidType(data.type);
//     } else {
//       setUuidType(UNKNOWN);
//     }
//   } catch (error) {
//     console.log('error: ', error);
//   }
// };

// const __Route = ({uuidType, uuid, setIsNavbarOpen}) => {
//   switch (uuidType) {
//     case FEED:
//       return <RouteFeed uuid={uuid} />;
//     case SLATE:
//       return <RouteSlate uuid={uuid} />;
//     case NODE:
//       return <RouteNode uuid={uuid} setIsNavbarOpen={setIsNavbarOpen} />;
//     case UNKNOWN:
//       return <NotFoundPage />;
//     case LOADING:
//     default:
//       return <FeedLoadingPage />;
//   }
// };

const UUID_PATTERN =
  '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}';
