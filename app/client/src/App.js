import React, { useEffect, useState } from 'react';
// import { HashRouter, Switch, Route } from 'react-router-dom';
import routes from './configs/routes';
import { connect } from "react-redux";
import Master from "./containers";
import Live from "./pages/Live";
import Splash from './pages/Splash';

const App = props =>
{
    const [ splash, setSplash ] = useState( true );
    const [ splashOpacity, setSplashOpacity ] = useState( 1 );
    const activedPath = props.menu.activedPath;
    const activedPathData = routes.filter(
        ( { Component, path, Master }, index ) =>
        {
            return (
                activedPath == path
            )
        } );

    useEffect( () =>
    {
        setTimeout( () =>
        {
            setSplashOpacity( 0 );
        }, 10000 );
        setTimeout( () =>
        {
            setSplash( false )
        }, 12000 );
    }, [] );

    const { Component, path, Master } = activedPathData && activedPathData[ 0 ] ? activedPathData[ 0 ] : routes[ 0 ]

    return (
        <React.Fragment>
            {
                !splash ?
                    <Master>
                        <Component />
                    </Master>
                    :
                    <Splash style={ { transition: "2000ms", opacity: splashOpacity } } />

            }
        </React.Fragment>
    )
}


const mapStateToProps = state =>
{
    return {
        menu: state.menuReducer
    }
}
export default connect( mapStateToProps )( App );