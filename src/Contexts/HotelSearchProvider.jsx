import dayjs from "dayjs";
import { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LOCATIONS, projectID } from "../constants";

const HotelSearchContext = createContext();
export const useHotelSearchContext = () => {
	return useContext(HotelSearchContext);
};
export default function HotelSearchProvider({ children }) {
	const [location, setLocation] = useState(0);
	const [checkinDate, setCheckinDate] = useState(new dayjs());
	const [checkoutDate, setCheckoutDate] = useState(new dayjs());
	const [hotelsData, setHotelsData] = useState([]);
	async function searchHotels(setIsLoading) {
		const searchVal = JSON.stringify({
			location: LOCATIONS[location].city,
		});
		const url = `https://academics.newtonschool.co/api/v1/bookingportals/hotel?search=${searchVal}&limit=1000`;
		try {
			const data = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					projectID: projectID,
				},
			});
			const res = await data.json();
			setHotelsData(res.data.hotels);
		} catch (error) {
			console.log(error);
			setHotelsData(null);
		} finally {
			setIsLoading(false);
		}
	}
	async function bookHotel(id, depDate, arrDate) {
		const JWT = JSON.parse(localStorage.getItem("authToken"));
		const body = {
			bookingType: "hotel",
			bookingDetails: {
				hotelId: id,
				startdate: depDate.toJSON(),
				endDate: arrDate.toJSON(),
			},
		};
		try {
			const data = await (
				await fetch(
					`https://academics.newtonschool.co/api/v1/bookingportals/booking`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${JWT}`,
							projectID: projectID,
						},
						body: JSON.stringify(body),
					}
				)
			).json();
			return data;
		} catch (error) {
			return { message: "Some Error Occurred!" };
		}
	}
	const provider = {
		location,
		setLocation,
		checkinDate,
		setCheckinDate,
		hotelsData,
		searchHotels,
		bookHotel,
		checkoutDate,
		setCheckoutDate,
	};
	return (
		<HotelSearchContext.Provider value={{ ...provider }}>
			{children}
		</HotelSearchContext.Provider>
	);
}