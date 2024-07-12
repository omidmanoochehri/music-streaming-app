import React from 'react';
import { Button, Container } from "reactstrap";
import { connect } from "react-redux";
import { SET_PATH, SET_SELECTED_PODCAST } from "../../redux/action-types";
import { Configs } from "../../configs";
import { MdKeyboardBackspace } from '@react-icons/all-files/md/MdKeyboardBackspace';
import moment from 'moment';

const PodcastsList = (props) => {
    const { podcasts, set_path, activedPath, set_selected_podcast,selected_cat } = props;

    const goToPodcast = (prop) => {
        set_selected_podcast(prop);
        set_path('/podcast');
    }

    return (
        <Container>
            {
                activedPath !== '/categories' ?
                    <div className="position-fixed w-100 backBtnContainer row p-3 d-flex align-items-center justify-content-between">
                        <Button color="secondary-outline" className="text-white" onClick={() => set_path('/categories')}><MdKeyboardBackspace /> Back</Button>
                        <span className="text-white">
                            {/* <small className="text-muted">Selected Genre: </small> */}
                        {selected_cat}</span>
                    </div>
                    : ""
            }
                <div className='row pt-5 pageContent'>
                    {
                        podcasts && podcasts.length > 0 ? podcasts.map((val, index) => {
                            return (
                                <div className='m-lg-auto mr-auto mb-2 col-lg-5 border-custom rounded' key={index} onClick={() => { goToPodcast(val) }}>
                                    <div className="row text-left align-items-center text-white podcast-contain p-2">
                                        <div className='col-4'>
                                            <img src={`${Configs.API_URL}:${Configs.API_PORT}/images/covers/${val.cover}`} className='img-fluid podcast-img rounded' alt="" />
                                        </div>
                                        <div className='col-8 p-4 podcast-text'>
                                            <p>{val.name}</p>
                                            <div className='row ml-0 justify-content-between'>
                                                <span className=''>{val.artist.name}</span>
                                                <span className='text-muted'>{moment.utc(parseInt(val.duration)).format("HH:mm:ss")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                            :
                            <h3 className="text-center w-100 pt-3">No podcast found!</h3>
                    }
                </div>
        </Container>
    );

}

const mapStateToProps = state => {
    return {
        podcasts: state.podcastReducer.podcasts,
        parentPath: state.menuReducer.parentPath,
        selected_cat:state.podcastReducer.selectedCat
    }
}

const mapDispatchToProps = dispatcher => {
    return {
        set_path: (path) => dispatcher({ type: SET_PATH, payload: path }),
        set_selected_podcast: (podcast) => dispatcher({ type: SET_SELECTED_PODCAST, payload: podcast })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PodcastsList);