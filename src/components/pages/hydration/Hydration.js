import React, { useState, useEffect, useCallback } from 'react';
import './hydration.css';
import { Link } from 'react-router-dom';
import API from "../../../utils/API.js"
import HydrationCard from './HydrationCard';
import moment from 'moment'
import Progress from './Progress';
import utilToday from '../../../utils/today.js';

export default function Hydration({ token, weekArray, goalObj, isLoggedIn }) {
    const [Data, setData] = useState({});
    const [todayOz, setTodayOz] = useState(0);
    const [thisWeek, setThisWeek] = useState([]);
    const [hydrationFormObject, setHydrationFormObject] = useState({
        date: '',
        water_oz: ''
    })
    const [updateReq, setUpdateReq] = useState('');
    const [existingItem, setExistingItem] = useState('');
    const [anotherDate, setAnotherDate] = useState('');
    const [anotherWeek, setAnotherWeek] = useState('');
    const [error, setError] = useState('');
    const [todayObj, setTodayObj] = useState({
        date: '',
        water_oz: ''
    })

    // same logic as the fitness page, with different keys in objects
    useEffect(() => {
        API.getUserHydration(token)
        .then((userData) => {
            setData(userData)
            const hydrationArray = [];
            weekArray.map(entry => {
                var response = userData.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);
                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, water_oz } = response;
                    newObj.id = id;
                    newObj.water_oz = water_oz
                }
                hydrationArray.push(newObj)
            })
            hydrationArray[0].day = 'Monday';
            hydrationArray[1].day = 'Tuesday';
            hydrationArray[2].day = 'Wednesday';
            hydrationArray[3].day = 'Thursday';
            hydrationArray[4].day = 'Friday';
            hydrationArray[5].day = 'Saturday';
            hydrationArray[6].day = 'Sunday';
            setThisWeek(hydrationArray)

            var todaysResponse = userData.find(data => data.date === utilToday)
            if (todaysResponse != undefined) {
                setTodayOz(todaysResponse.water_oz)
            } else {
                setTodayOz(0)
            }
        })
        .catch((err) => console.log(err))
    }, [token, updateReq])

    useEffect(() => {
        API.getOneUserHydration(token, hydrationFormObject.date)
        .then((response) => {
            if (response.id) {
                setHydrationFormObject({
                    date: response.date,
                    water_oz: response.water_oz
                })
                setExistingItem(true);
            } else {
                setHydrationFormObject({
                    date: hydrationFormObject.date,
                    water_oz: ''
                })
                setExistingItem(false);
            }
        })
        .catch((err) => console.log(err))
    }, [hydrationFormObject.date])

    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();
        await API.updateHydrationEntry(token, hydrationFormObject)
        .then((res) => {
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        setHydrationFormObject({
            date: '',
            water_oz: ''
        })
        setUpdateReq(false)
    })

    const sendCreate = useCallback(async (e) => {
        e.preventDefault();
        API.postHydrationEntry(token, hydrationFormObject)
        .then((res) => {
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        setHydrationFormObject({
            date: '',
            water_oz: ''
        })
        setUpdateReq(false)
    })

    const sendDelete = useCallback(async (e) => {
        e.preventDefault();
        API.deleteHydrationEntry(token, hydrationFormObject.date)
        .then((response) => {
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        setHydrationFormObject({
            date: '',
            water_oz: ''
        })
        setUpdateReq(false)
    })

    const reqAnotherWeek = useCallback(async (e) => {
        e.preventDefault();
        if (anotherDate) {
            let anotherWeek = [];
            for (let i = 1; i < 8; i++) {
                let thisDay = moment(anotherDate).day(i).format("YYYY-MM-DD");
                anotherWeek.push(thisDay)
            }

            const anotherHydrationArray = [];
            anotherWeek.map(entry => {
                var response = Data.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);

                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, water_oz } = response;
                    newObj.id = id;
                    newObj.water_oz = water_oz
                }
                anotherHydrationArray.push(newObj);
            })
            anotherHydrationArray[0].day = 'Monday';
            anotherHydrationArray[1].day = 'Tuesday';
            anotherHydrationArray[2].day = 'Wednesday';
            anotherHydrationArray[3].day = 'Thursday';
            anotherHydrationArray[4].day = 'Friday';
            anotherHydrationArray[5].day = 'Saturday';
            anotherHydrationArray[6].day = 'Sunday';
            setAnotherWeek(anotherHydrationArray)
            setError('')
        } else {
            setError('Please choose a valid date.')
        }
    })

    // ADD WATER TO TODAY/FILL UP GLASS
    const todayChange = (e) => {
        e.preventDefault();
        // add existing value for todays water with the incoming addition
        const newAmount = parseFloat(todayOz) + parseFloat(e.target.value);
        // create object
        setTodayObj({
            date: utilToday,
            water_oz: newAmount
        })
    }
    // send update request with today object to update todays value 
    const sendToday = useCallback(async (e) => {
        e.preventDefault()
        console.log(todayObj.water_oz)
        console.log(todayOz)
        if (todayOz == 0) {
            await API.postHydrationEntry(token, todayObj)
            .then((res) => {
                setUpdateReq(true)
            })
            .catch((err) => console.log(err))
            setUpdateReq(false)
        } else {
            await API.updateHydrationEntry(token, todayObj)
            .then((res) => {
                console.log(todayObj)
                setUpdateReq(true)
            })
            .catch((err) => console.log(err))
            setUpdateReq(false)
        }
    });

    return (
        <div className="hydration">
            {!isLoggedIn ? (
                <h2><Link className="pageLink" to='/login'>Click here to login</Link></h2>
            ) : (
                <>
                    <h1>Hydration</h1>
                    {goalObj.hydration_oz != 0 && (
                        <>
                        <h2>Your Goals</h2>
                        <h4 className=''>Your daily water intake goal is {goalObj.hydration_oz} oz.</h4>
                        </>
                    )}
                    <h2>Report Water Intake</h2>
                    <form className="waterForm">
                        <label htmlFor="waterDate">
                            Choose date:
                        </label>
                        <input
                            value={hydrationFormObject.date}
                            type="date"
                            id="waterDate"
                            name="waterDate"
                            onChange={(e) => setHydrationFormObject({ ...hydrationFormObject, date: e.target.value })}
                        />
                        <label htmlFor="waterAmount">
                            How many ounces did you drink? If left blank will report '0 oz'.
                        </label>
                        <input
                            value={hydrationFormObject.water_oz}
                            min="0"
                            max="1000"
                            type="number"
                            id="waterAmount"
                            name="waterAmount"
                            placeholder="32"
                            onChange={(e) => setHydrationFormObject({ ...hydrationFormObject, water_oz: e.target.value })}
                        />
                        <br />
                        {(existingItem == true) ? (
                            <>
                                <button type="button" className="hydroBtn"
                                    onClick={sendUpdate}>Update</button>
                                <button type="button" className="hydroBtn"
                                    onClick={sendDelete}>Delete</button>
                            </>
                        ) : (
                            <button className="hydroBtn" type="button" onClick={sendCreate}>Submit</button>
                        )}
                    </form>
                    <h2>Today's progress:</h2>
{/* fill water glass based on goal hydration oz and today's reported hydration oz */}
                    <Progress className='progressBox' goal={goalObj.hydration_oz} amount={todayOz} />
                    <div className='todayFormDiv'>
                            <form className='todayForm'>
                                <label>Add</label>
                                <input
                                    min="0"
                                    type="number"
                                    id="waterAmount"
                                    name="waterAmount"
                                    placeholder="12"
                                    onChange={todayChange}
                                    />
                                <label>Ounces</label>
                                <button className="todayBtn" type="button" onClick={sendToday}>Submit</button>
                            </form>
                    </div>
                    <h2>This week's hydration reporting: </h2>
                    <HydrationCard
                        name='hydrationCard'
                        results={thisWeek}
                        goal={goalObj.hydration_oz}
                    />
                    <div className='anotherWeekSection'>
                        <h2>View another week's hydration reporting:</h2>
                        <form className='chooseDate'>
                            <label htmlFor='anotherDate'>Date</label>
                            <input
                                value={anotherDate}
                                type="date"
                                name="anotherDate"
                                onChange={(e) => setAnotherDate(e.target.value)}
                            />
                            {error && (
                                <div>
                                    <p className="error">{error}
                                    </p>
                                </div>
                            )}
                            <button className="hydroBtn" type="button" onClick={reqAnotherWeek}>Submit</button>
                        </form>
                        {anotherWeek ? (
                            <HydrationCard
                                results={anotherWeek} 
                                goal={goalObj.hydration_oz}
                                />
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
