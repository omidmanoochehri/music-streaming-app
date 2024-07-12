import React from "react";
import { Container, Row } from "reactstrap";
import splash from "../../utilities/images/splash.gif";
import splashDesktop from "../../utilities/images/splashDesktop.gif";

const Splash = ({style}) =>
{
    return (
        <Container fluid={ true } style={style}>
            <Row className="align-items-center justify-content-center" style={ { height: "100vh" } }>
                <img className="w-100" src={ window.innerWidth > 990 ? splashDesktop : splash } alt="" />
            </Row>
        </Container>
    )
}
export default Splash;