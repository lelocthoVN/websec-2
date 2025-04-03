import React from 'react';
import axios from 'axios';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';

class Schedule extends React.Component {
    static defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            current_week: null,
            staffId: null,
            groupId: null
        };
        this.prevWeek = this.prevWeek.bind(this);
        this.nextWeek = this.nextWeek.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.staffId !== state.staffId || props.groupId !== state.groupId) {
            return {
                staffId: props.staffId,
                groupId: props.groupId,
            };
        }
        return null;
    }

    async getCurrentWeek() {
        const apiUrl = `http://localhost:5000/api/get_current_week`;
        const res = await axios(apiUrl);
        return await res.data.current_week;
    }

    async getData() {
        let apiUrl = `http://localhost:5000/api/get_week_schedule?week=${this.state.current_week}`;
        if (this.state.staffId != null) {
            apiUrl += `&staffId=${this.state.staffId}`;
        } else if (this.state.groupId != null) {
            apiUrl += `&groupId=${this.state.groupId}`;
        }
        const res = await axios(apiUrl);
        return await res.data;
    }

    prevWeek() {
        (async () => {
            try {
                await this.setState({ current_week: this.state.current_week - 1, data: null });
                this.setState({ data: await this.getData() });
            } catch (e) {
                console.error(e);
            }
        })();
    }

    nextWeek() {
        (async () => {
            try {
                await this.setState({ current_week: Number(this.state.current_week) + 1, data: null });
                this.setState({ data: await this.getData() });
            } catch (e) {
                console.error(e);
            }
        })();
    }

    componentDidMount() {
        (async () => {
            try {
                const week = await this.getCurrentWeek();
                this.setState({ current_week: week }, async () => {
                    try {
                        this.setState({ data: await this.getData() });
                    } catch (e) {
                        console.error(e);
                    }
                });
            } catch (e) {
                console.error(e);
                this.setState({ current_week: 1 });
            }
        })();
    }

    render() {
        return (
            <div className="schedule">
                {(this.state.data === undefined || this.state.data === null || !Array.isArray(this.state.data)) ? (
                    <em>Загрузка...</em>
                ) : (
                    <div>
                        {(this.state.current_week == null) ? (
                            <em>Определение недели..</em>
                        ) : (
                            <div className="week-navigation">
                                <button onClick={this.prevWeek}>Предыдущая неделя</button>
                                <span className="current_week">{this.state.current_week} неделя</span>
                                <button onClick={this.nextWeek}>Следующая неделя</button>
                            </div>
                        )}

                        <table>
                            <tbody>
                                {this.state.data.map((element, row_index) => (
                                    <tr key={row_index} className={row_index === 0 ? "schedule_head" : ""}>
                                        {element.row_data.map((elem_td) => (
                                            <td key={elem_td.id} className={row_index === 0 ? "schedule__time" : "schedule_item"}>
                                                {elem_td.color !== undefined && (
                                                    <span className={`schedule__lesson-type-color lesson-type-${elem_td.color}__color`}></span>
                                                )}
                                                {elem_td.text.split('\n').map((line, index) => (
                                                    <div key={index} style={index === 0 ? { fontWeight: 'bold' } : {}}>
                                                        {line}
                                                    </div>
                                                ))}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
}

export default Schedule;
