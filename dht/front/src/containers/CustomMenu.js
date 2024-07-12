import React from 'react';
import { connect } from "react-redux";
import { SET_PATH, SET_PARENT_PATH } from "../redux/action-types";

const CustomMenu = props => {
    const { setPath, activedPath, path, parentPath, set_parent_path } = props;
    const handleMenu = () => {
        setPath(path);
        set_parent_path("-1");
    }
    return (
        <a
            className={"col d-inline text-center p-0 menu-item-size " + (activedPath === path || parentPath === path ? "text-white" : "")} onClick={() => handleMenu()}>
            <div className='menu-icon-custom'>{props.icon}</div>
            <div className='menu-label-custom'>{props.label}</div>
        </a>
    )
}
    ;

const mapStateToProps = state => {
    return {
        activedPath: state.menuReducer.activedPath,
        parentPath: state.menuReducer.parentPath
    }
}

const mapDispatchToProps = dispatcher => {
    return {
        setPath: path => dispatcher({ type: SET_PATH, payload: path }),
        set_parent_path: (path) => dispatcher({ type: SET_PARENT_PATH, payload: path })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomMenu);


