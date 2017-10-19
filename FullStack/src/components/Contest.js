import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Contest extends Component {
  
  state = {
    newname: ''
  };
  
  componentDidMount() {
    this.props.fetchNames(this.props.nameIds);
  }
  
  handleChange = (event) => {
    event.preventDefault();
    this.setState({newname: event.target.value});
  };
  
  handleSubmit = (event) => {
    event.preventDefault();
    this.props.addName(this.state.newname, this.props._id);
    this.setState({newname: ''});
  };
  
  render() {
    return (
      <div className="Contest">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Contest Description</h3>
          </div>
          <div className="panel-body">
            <div className="contest-description">
              {this.props.description}
            </div>
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Proposed Names</h3>
          </div>
          <div className="panel-body">
            <ul className="list-group">
              {this.props.nameIds.map(nameId =>
                <li key={nameId} className='list-group-item'>
                  {this.props.lookupName(nameId).name}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="panel panel-info">
          <div className="panel-heading">
            <h3 className="panel-title">Propose a New Name</h3>
          </div>
          <div className="panel-body">
            <form onSubmit={this.handleSubmit}>
              <div className="input-group">
                <input type="text"
                  placeholder="New Name Here..."
                  onChange={this.handleChange}
                  value={this.state.newname}
                  className="form-control" />
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-info">
                    Sumbit
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>

        <div className="home-link link" onClick={this.props.contestListClick}>
          Contest List
        </div>
      </div>
    );
  }
}

Contest.propTypes = {
  description: PropTypes.string.isRequired,
  contestListClick: PropTypes.func.isRequired,
  fetchNames: PropTypes.func.isRequired,
  nameIds: PropTypes.array.isRequired,
  lookupName: PropTypes.func.isRequired,
  addName: PropTypes.func.isRequired,
  _id: PropTypes.string.isRequired
};

export default Contest;
