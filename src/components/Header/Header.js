import React from "react";
import "./Header.css";

import { Layout, Button } from "antd";
import {
  BellOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import HeaderManagement, { navRight } from "./HeaderManagement";

const { Header } = Layout;

class HeaderComponent extends React.Component {
  state = {
    projects: [],
    names: [],
    advisor: "",
    collapsed: true,
  };

  onClick = () => {
    this.props.onClick();
  };

  getProjects() {
    let data = [];
    fetch("http://localhost:3005/project/getProjects")
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        for (let i = 0; i < response.result.length; i++) {
          data.push(response.result[i]);
        }
        if (this.state.projects.length === 0) {
          this.setState({ projects: data });
        }
      });
  }

  onChangeGetProfiles = (value) => {
    if (value > 0) {
      this.getParticipants(value);
    }
  };

  getParticipants(id) {
    let data = [];
    fetch(`http://localhost:3005/project/getParticipans?id=${id}`)
      .then((res) => res.json())
      .then((response) => {
        this.setState({
          names: response.result.entrepreneurs,
          advisor: response.result.advisor,
        });
      });
  }

  optionsHeader() {
    let options = null;
    if (this.props.path === "/admin/management") {
      this.getProjects();
      return (
        <HeaderManagement
          projects={this.state.projects}
          names={this.state.names}
          advisor={this.state.advisor}
        />
      );
    } else {
      options = <navRight />;
    }

    return options;
  }
  componentDidMount() {
    this.optionsHeader();
  }

  render() {
    return (
      <Header className="site-layout-background" style={{ padding: 0 }}>
        <div className="Navbar">
          <div className="Menu-button">
            <Button type="primary" onClick={this.onClick} style={{}}>
              {React.createElement(
                this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
              )}
            </Button>
          </div>

          {this.optionsHeader()}
        </div>
      </Header>
    );
  }
}

export default HeaderComponent;
