import React, { Component } from "react";
import { List, Col, Row, Button, Modal, 
  Form, Input, Select, Tag,
  Avatar, Tooltip, Space, Divider, Steps, DatePicker, Upload, Checkbox } from "antd";
import ManagementApi from '../../api/management/managenmentApi';
import './management.css'; 
import AvatarComponent from './avatar';
import DetailActivity from './detailActivity';
import ContentTabs from './contentTabs';
import AssigmentAdviser from './assigmentAdvisers';

import img_management from '../../assets/management.svg';
import { BorderOutlined , MessageOutlined, FileOutlined} from "@ant-design/icons";
import SocketIOClient  from 'socket.io-client';
import moment from 'moment';
import Http from "../../api/http";
const api = new ManagementApi();
const http = new Http();
const END_POINT_SOCKET =  'http://localhost:4000';

const {Step}  = Steps;
const {Option} = Select;
const { info } = Modal;
const {RangePicker} = DatePicker;
const {success, error} = Modal;
const { TextArea } = Input;
 
const steps_titles = [
  {
    title: '1'
  },
  {
    title: '2'
  }
];
class management extends Component {
  state = {
    visibleBtn: 'none',
    visible: false,
    visibleImg: 'block',
    visibleList: 'none',
    visibleContent: false,
    showModalAssigment: false,
    titleModal: '',
    project: [],
    projects:[],
    idProject: -1,
    phases: [],
    visibleDrawer: false,
    detailtActivity: [],
    idActivityEdit: '',
    responsables: '',
    stateActivity: '',
    phaseSelect: '',
    week: '',
    activities: [],
    assign: [],
    names:[],
    advisor: '',
    showComponent: false,
    nameAssigned: '',
    image: '',
    urlresource: '',
    description: '',
    progress: 1,
    activity: ''

  };

  constructor(){
    super();
    this.showDetailRow = this.showDetailRow.bind(this);
  }

  connectSocket(){
   const io = SocketIOClient(END_POINT_SOCKET);
   io.emit('/users', "Hi");
    console.log("socket happy :)");

  }

  getState(state) {
    console.log("state ", typeof state);
    let stateHtml = null;
    switch (state) {
      case '1':
        stateHtml = (<Tag color='processing'>En ejecucion</Tag>)
        break;
      case '2':
        stateHtml =  (<Tag color='success'> Termindo </Tag>)
        break;
      default:
        stateHtml = (<Tag color='default'>Sin estado</Tag>)
        break;
    }
  
    return stateHtml;
  }

  onChangeWeek = (week) =>{
    
    const week_result = `${moment(new Date(week[0])).format('YYYY-MM-DD')} ${moment(new Date(week[1])).format('YYYY-MM-DD')}`
    this.setState({
      week: week_result
    });
    console.log("Moment ", week_result );
  }

  setVisibleModal = (e)=>{
    let title = '';
    if(e.target.name == 'add') {
      title = 'Crear Evento';
    }else {
      title = 'Editar Evento';
    }
    this.setState({visible: true, titleModal: title});
  }

  setVisibleDrawer = ()=>{
    this.setState({visibleDrawer: true});
  }

  closeModal = () =>{
    this.setState({visible: false});
  }

  closeDrawer = ()=>{
    this.setState({visibleDrawer: false});
  }

  getProject = async (id) =>{
    
    let response  = await api.getProjectById(id);
    console.log("projectsssssss: ", response);
      if(response.result.length > 0){
        return {phases: response.phases , project: response.result};
      }
  }


  async getAllProjects() {
    const response = await api.getProjects(localStorage.getItem('role'), localStorage.getItem('username'));
    this.setState({projects: response.result});
  }

  async getProjectEntrepreneur() {
    const response = await http.get(`project/getProjects?type=${localStorage.getItem('role')}&name=${localStorage.getItem('username')}`);
    
    this.setState({projects: response.result})
  }

  componentDidMount(){
    if(localStorage.getItem('role') === 'adviser'){
      this.getAllProjects();
    }else if (localStorage.getItem('role') === 'entrepreneur'){
      console.log("getProjectEntrepreneur >>>>");
      this.getProjectEntrepreneur();
    }
   
    this.connectSocket();
  }

  showDetailRow = (data) =>{
    console.log(data);
    this.setState({ detailtActivity: data, showComponent:true});
    this.setVisibleDrawer();
  }
  getResponsables = (values)=>{
    this.setState({assign: values});
    this.getParticipants(this.state.idProject);
  }

  getParticipants = async (id)=>{
    let options = [];
    const response = await api.getParticipants(id)
    options.push(<Option value={response.result.advisor} key={0}>{response.result.advisor}</Option>)
    for(let i=0; i < response.result.entrepreneurs.length; i++){
      options.push(<Option value={response.result.entrepreneurs[i].name}
         key={i+1}>{response.result.entrepreneurs[i].name}</Option>)
    }
    console.log(options);
    return options;
  }

  getStates = (value)=>{
    this.setState({stateActivity: value});
  }
  setPhase(phase){
    console.log(phase, " : ",this.state.phaseSelect);
    if(this.state.phaseSelect != phase){
        this.setState({phaseSelect: phase});
    }
  }

  changeData = (e) =>{
    console.log(e.target.name, " ", e.target.value );
    this.setState({[e.target.name]: e.target.value});
  }

  changeWeek = (e, index) =>{
    console.log("value", e, " index", index);
    this.setState({week: e.target.name});
  }

  getActivities = async (id, phase) => {

      const response = await api.getActivityByProjectAndPhase(id, phase);
      console.log("Activities :", response);
      return response.result;
  }

  getProfiles(_nameshort, _responsables){
    let htmlProfile = `<div>`;  
    const responsables =  _responsables.split(',');
    const nameshort = _nameshort.split(',');
      if(responsables.length > 0) {
        for(let i=0; i < responsables.length; i++){
          htmlProfile = htmlProfile + 
          `<Tooltip placement="top" title={${responsables[i]}}>
              <Avatar>{${nameshort[i]}}</Avatar>
          </Tooltip>`
        } 
         htmlProfile = htmlProfile + `</div>`
      }else{
        htmlProfile = <span>Error no se puede obtener los responsables</span>
      }
      return (htmlProfile);
  }

  createActivity = async () =>{

    let assings = '';
    
    for(let i=0; i < this.state.assign.length; i++){
      console.log("...",this.state.assign[i]);
      assings = ((i + 1) == this.state.assign.length) 
      ?  assings + this.state.assign[i] : assings + this.state.assign[i] + ","; 
    }
   
    const data = {
      nameActivity: this.state.activity ,
      responsables:assings , 
      state: this.state.stateActivity[0],
      phase: this.state.phaseSelect,
      id: this.state.idProject,
      week: this.state.week,
      description: this.state.description,
      resources :  this.state.urlresource
    };
    console.log("data >> ", data);
    const response = await api.createActivity(data);
    
    if(response.result  == 'created'){
      success({content: 'se creo la actividad correctamente'});
      this.callgetActivities(this.state.idProject, this.state.phaseSelect, 0);
      this.closeModal();
    }else {
      error({content: 'ha habido un error al crear la actividad'});
    }
  }

  EditActivity =  () =>{
    this.getActivityById()
    
  }

  async getActivityById (){
    const response = await http.get(`project/getActivity?id=${this.state.idActivityEdit}`)
    console.log("edit activity >>> ", response);
    const activity = response.result[0];
    this.setState({
      activity : activity.nameActivity,
      description: activity.description,
      // responsables: activity.responsables.split(","),
      progress :  activity.state
    });

    console.log(this.state);
  }

  callgetActivities = async (id, phase, type_execution) => {
    const activities = await this.getActivities(id, phase);
    
    this.setState({activities: activities, visibleContent: true, phaseSelect: phase});
    if(type_execution == 1) {
      this.getAssignment();
    }
  }

  getAssignment = async () =>{
    const response = await http.get(`project/getAssignment?id=${this.state.idProject}&phase=${this.state.phaseSelect}`);
    console.log("adviser assigned ", response.result.nameAssigned);
    this.setState({nameAssigned: response.result.nameAssigned, image: response.result.image});
  }


  onChangeGetProfiles = async (id)=>{
    if(id != '-1'){
      const response = await api.getParticipants(id);
      const {phases, project} = await this.getProject(id);
      const options  = await this.getParticipants(id);
      const activities = await this.getActivities(this.state.idProject, phases[0].phase);
      console.log("Phase[0]", phases[0].phase);
      this.setState({
        names: response.result.entrepreneurs,
        advisor: response.result.advisor,
        visibleBtn: 'block',
        visibleImg: 'none',
        visibleList: 'block',
        idProject: id,
        project: project,
        phases: phases,
        responsables: options,
        activities: activities,
        key: phases[0]
      });
    }else {
      info({content: "Usted no tiene ningun proyecto asociado"});
    }
    
  }

  showModalAssigment = () => {
    this.setState(
      {showModalAssigment: true}
    )
  }

  closeModalAssigment = () =>{
    this.setState({
      showModalAssigment: false
    })
  }

  onChangeFile = (info) =>{
    if(info.file.status == 'done'){
      console.log(info.file.response.image.replace(/\\/g, "//"));
      this.setState({
          urlresource: info.file.name
      });
      
    }
  }

  getIdActivity = (recoder) => {
    this.setState({
      idActivityEdit: recoder.id
    })
  }

  render() {
    const states = [<Option key="1" value="1">En Ejecucion</Option>,
      <Option key="2" value="2">Cumplidad</Option>,
      <Option key="3" value="3">Suspendida</Option> ];
    
    const originColumns  = [
    {
      title: "Id",
      dataIndex: 'id',
      key: 'id',
      render: (text, recoder) => <Checkbox onClick={() => this.getIdActivity(recoder)} />

    },  
    {
      title: "Actividad",
      dataIndex: "nameActivity",
      key: "nameActivity",
    },{
      title: "Responsables",
      dataIndex: "responsables",
      key: "responsables",
      render: (text, recoder) => <AvatarComponent profiles={recoder.profile} />
    },
    {
      title: "Estado de la actividad",
      dataIndex: "state",
      key: "state",
      render: (text, recoder)=> this.getState(recoder.state)
    }];
    return (
      
      <Row>

        <Col>
          <h3>Gestion de proyectos</h3>
         
        </Col>
        <Col span={20}>
        <Space size={8}>
        <div className="Content_Select">
          <p>Seleciona un proyecto</p>
          <Select className="Select_Project"
              defaultValue="Selecione Un Proyecto"
              onChange={this.onChangeGetProfiles}
            >
            {this.state.projects.length > 0 ? (
                this.state.projects.map((project, index) => {
                  return (
                    <Option value={project.idProject}>
                      {project.projectName}
                    </Option>
                  );
                })
              ) : (
                <Option value="-1">No hay Projectos</Option>
              )}
              
            </Select>
        
        </div>
        <div className="Div-Avatar">
            <Space size={8}>
              {this.state.names.map((profile, index) => {
                return (
                  <Tooltip placement="top" title={profile.name}>
                    <Avatar>{profile.nameshort}</Avatar>
                  </Tooltip>
                );
              })}
                {
                  this.state.advisor != '' ?  <> <span>Asesor</span> 
                  <Tooltip placement="top" title={this.state.advisor} >
                      <Avatar >{this.state.advisor}</Avatar>
                  </Tooltip> </>: null
                  }
            </Space>
          </div>
          </Space>
          <Modal visible={this.state.visible}
            title={this.state.titleModal}
            onCancel = {this.closeModal}
            onOk = {this.createActivity}>
            <Form className="Form_Modal">
              <Form.Item>
                    <h6>Fase Metodologica Actual</h6>
                    <Tag color="blue">{this.state.phaseSelect}</Tag>
              </Form.Item>
              <Form.Item>
                <label>Nombre de la actividad</label> <br />
                <Input placeholder="Actividad" name='activity' value={this.state.activity} onChange={this.changeData}/>
              </Form.Item>

              <Form.Item>
                  <label>Descripcion de la actividad</label>
                  <TextArea name="description" value={this.state.description} onChange={this.changeData}/>
              </Form.Item>

              <Form.Item>
                  <label>Asignar Actividad</label> <br />
                  <Select 
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Asignar a"
                    onChange={this.getResponsables}>
                    {this.state.responsables}
                  </Select>
              </Form.Item>
              <Form.Item>
                  <label>Progreso</label>
                  <Select 
                        defaultValue={this.state.progress}
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Progreso"
                        onChange={this.getStates}>                        
                        {states}
                      </Select>
              
              </Form.Item>
                   
              <Form.Item>
                <label>Añadir semana de la actividad</label><br/>
                <RangePicker defaultValue={moment(new RangePicker())} onChange={this.onChangeWeek}/>
              </Form.Item>

              <Form.Item>
                <label>Agregar Recursos</label> <br/>
                <Upload
                  action="http://localhost:3005/project/uploadFile"
                  onChange={this.onChangeFile}

                  name="uploadFile">
                    <Button>Subir Recurso</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button onClick={()=>{ this.state.titleModal == 'Crear Evento' ? 
                this.createActivity() : this.EditActivity() }} className="Btn_Activity">
                  {this.state.titleModal}
                </Button>
              </Form.Item>

            </Form>
          </Modal>
          <AssigmentAdviser  showModalAssigment={this.state.showModalAssigment} 
            closeModalAssigment={this.closeModalAssigment}
            phases={this.state.phases} idProject={this.state.idProject}/>
          {
            this.state.showComponent ? <DetailActivity visibleDrawer={this.state.visibleDrawer}
            closeDrawer={this.closeDrawer} detailtActivity={this.state.detailtActivity}  /> : null
          }

          <Divider /> 
        </Col>
        <Col span={24}>
              <Row>
                <Col span={10}>
                  <div className="Content_Img" style={{display: this.state.visibleImg}}>
                    <img className="Img_Management"src={img_management}/>
                  </div>
                  <div className="Content_Methodologies" style={{display: this.state.visibleList}} >
                      <List  header={<h5>Fases Metodologicas</h5>}
                        bordered
                        dataSource={this.state.phases}
                        renderItem={ 
                          item => (
                            <List.Item key={item.phase}  className="List_Item" actions={[<a onClick={()=> this.callgetActivities(this.state.idProject, item.phase, 1)}>ver mas</a>]}>
                              <div className="Content_List">
                               <p>{item.phase}</p>
                               <Space size={8}> 
                                  <Tooltip title="Cantidad de mensajes" placement="top">
                                      <MessageOutlined /> <span> {item.amountComments} </span>
                                  </Tooltip>
                                  <Tooltip title="Cantidad de actividades" placement="top">
                                      <FileOutlined /> <span> {item.amountActivities} </span>
                                  </Tooltip>
                               </Space>  
                              </div>
                            </List.Item>
                          )
                        }
                      >
                      </List>
                  </div>
                </Col>
                <Col span={14}>
                  {this.state.visibleContent ? 
                 ( <>

                  <Space size={8}>
                    <Button onClick={this.setVisibleModal} name="add" >Crear actividad</Button>
                    <Button onClick={this.setVisibleModal} name="edit" >Editar actividad</Button>
                    <Button onClick={this.showModalAssigment}> Asig. Asesor a una fase</Button>
                    {this.state.nameAssigned != '' ? (
                    <>
                      <label>Asesor de la fase: </label>
                      <Tooltip title={this.state.nameAssigned}> 
                        <Avatar src={this.state.image} />
                      </Tooltip>
                    </>) : null}
                  </Space>
                  <ContentTabs columns={originColumns} 
                      dataSource={this.state.activities} showDetail={this.showDetailRow}/>
                  </>) : null}
  
                </Col>

              </Row>
        </Col>
      </Row>
    );
  }
}

export default management;
