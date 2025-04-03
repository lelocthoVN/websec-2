import React from 'react';
import axios from 'axios';

class SearchStaff extends React.Component {
    state = {
      query: "",
      data: [],
      filteredData: [],
      staffId: null,
    };
    handleInputChange = event => {
      const query = event.target.value;
      this.setState(prevState => {
        let filteredData = prevState.data.filter(element => {
          return element.fio.toLowerCase().includes(query.toLowerCase());
        });
        if (filteredData.length > 10) {filteredData = filteredData.slice(0, 10)};
        return {
          query,
          filteredData
        };
      });
    };
    handleClick(id) {
        this.setState({staffId: id});
        this.props.staffCallback(id);
    }
    constructor(props) {
        super(props);
        this.state = {query: "", data: null, filteredData: [], staffId: null};
        this.handleClick = this.handleClick.bind(this);
    }
    getData = () => {
        let URL = `http://localhost:5000/api/search_staff?fio=${this.state.query}`;
        axios.get(URL)
        .then(response => response.data)
        .then(data => {
          const { query } = this.state;
          const filteredData = data.filter(element => {
            return element.fio.toLowerCase().includes(query.toLowerCase());
          });
          this.setState({
            data,
            filteredData
          });
        });
    };
    componentDidMount() {
        if (!this.state.data)
        {
            this.getData();
        }
    }
    render() {
      return (
        <div className="searchForm">
          <form>
            <input
              placeholder="Введите ФИО"
              value={this.state.query}
              onChange={this.handleInputChange}
            />
          </form>
          <div className="searchResults">{(this.state.query === "") ? "" : 
            this.state.filteredData.map(elem => <button className={"btn searchElement " +  (this.state.staffId == elem.id ? "btn-info" : "btn-outline-info")}
                id={elem.id} key={elem.id} onClick={() => {this.handleClick(elem.id)}}>{elem.fio}</button>)}
            </div>
        </div>
      );
    }
  }

  
export default SearchStaff;