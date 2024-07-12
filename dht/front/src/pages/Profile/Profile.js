import React, {Component} from 'react';
import {Container} from 'reactstrap';
import { FaUserClock } from '@react-icons/all-files/fa/FaUserClock';
class Profile extends Component{
    render() {
        return (
            <Container>
                <div className='text-center mt-5'>
                    <h1>
                        <FaUserClock/>
                        <br/>
                        Coming Soon
                    </h1>
                </div>
            </Container>
        );
    }
}

export default Profile;