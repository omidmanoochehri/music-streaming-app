import React from "react";
import "../utilities/styles/App.css";
import CustomMenu from "./CustomMenu";
import { FiRadio } from "@react-icons/all-files/fi/FiRadio";
import { FiSearch } from "@react-icons/all-files/fi/FiSearch";
import { CgMenuGridO } from "@react-icons/all-files/cg/CgMenuGridO";
import { FiUser } from "@react-icons/all-files/fi/FiUser";
import DesktopMenu from "./DesktopMenu";
import logo from "../utilities/images/logo.png";
import { connect } from "react-redux";
import { SET_PARENT_PATH, SET_PATH } from "../redux/action-types";

const Menu = ({ setPath, set_parent_path }) => {
  return (
    <header className="col-12">
      <div className="container d-none d-lg-flex align-items-center p-4">
        <div className="row w-100">
          <div className="col-lg-4">
            <img
              className="logoApp pr-4"
              onClick={() => {
                setPath("/");
                set_parent_path("-1");
              }}
              src={logo}
              alt="logo"
            />
          </div>
          <nav className="col-lg-8 d-flex align-items-center">
            <DesktopMenu label="Live" path={"/"} />
            <DesktopMenu label="Search" path={"/search"} />
            <DesktopMenu label="Categories" path={"/categories"} />
            <DesktopMenu label="Profile" path={"/profile"} />
          </nav>
        </div>
      </div>

      <div className="row fixed-bottom menu-container border-top-custom d-lg-none justify-content-center align-items-center">
        <CustomMenu label="Live" path={"/"} icon={<FiRadio />} />
        <CustomMenu label="Search" path={"/search"} icon={<FiSearch />} />
        <div
          className="logo-mobile-menu"
          onClick={() => {
            setPath("/");
            set_parent_path("-1");
          }}
        ></div>
        <CustomMenu
          label="Categories"
          path={"/categories"}
          icon={<CgMenuGridO />}
        />
        <CustomMenu label="Profile" path={"/profile"} icon={<FiUser />} />
      </div>
    </header>
  );
};

const mapDispatchToProps = (dispatcher) => {
  return {
    setPath: (path) => dispatcher({ type: SET_PATH, payload: path }),
    set_parent_path: (path) =>
      dispatcher({ type: SET_PARENT_PATH, payload: path }),
  };
};

export default connect(null, mapDispatchToProps)(Menu);
