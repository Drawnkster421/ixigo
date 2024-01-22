import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Popper from "@mui/material/Popper";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useRef, useState } from "react";
import notFound from "../../assests/images/flightnotFound.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import swapSVG from "../../assests/svgs/swap-white.svg";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { BiSolidError } from "react-icons/bi";
import FlightCard from "./FlightCard";
import { useSearchContext } from "../Contexts/SearchProdiver";
import ControlledCustomInput from "./ControlledCustomInput";
import dayjs from "dayjs";
const popperSX = {
	border: 0,
	py: 0.5,
	px: 1,
	fontSize: "14px",
	bgcolor: "#FFFFFF",
	color: "#D50000",
	fontWeight: 500,
	display: "flex",
	alignItems: "center",
	mt: "0px",
	borderBottomRightRadius: "5px",
	borderBottomLeftRadius: "5px",
};
const sortingMethodsList = [
	{ name: "RECOMMENDED", value: "recommended" },
	{ name: "CHEAPEST", value: "cheapest" },
	{ name: "QUICKEST", value: "quickest" },
	{ name: "EARLIEST", value: "earliest" },
];
const airlinesInfo = [
	{ name: "Air India", key: "AI" },
	{ name: "IndiGo", key: "6E" },
	{ name: "Vistara", key: "UK" },
	{ name: "SpiceJet", key: "SG" },
	{ name: "Go First", key: "G8" },
];
export default function Search() {
	const {
		fromCity,
		setFromCity,
		toCity,
		setToCity,
		departureDate,
		setDepartureDate,
		travellers,
		setTravellers,
		data,
		searchBookings,
		airports,
	} = useSearchContext();
	const fromRef = useRef();
	const toRef = useRef();
	const departureRef = useRef();
	const passengerRef = useRef();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [stops, setStops] = useState(2);
	const [alignment, setAlignment] = useState(null);
	const [price, setPrice] = useState(2500);
	const [withfilters, setWithFilters] = useState(false);
	const [filteredData, setFilteredData] = useState([]);
	const [anchorEl, setAnchorEl] = useState(null);
	const [errorMesaage, setErrorMessage] = useState("");
	const [sortingMethod, setSortingMethod] = useState("recommended");
	const [pageNumber, setPageNumber] = useState(1);
	const [airlines, setAirlines] = useState({
		"6E": false,
		AI: false,
		UK: false,
		SG: false,
		G8: false,
	});
	const handleChange = (event, newAlignment) => {
		setAlignment(newAlignment);
	};
	const displayFromCity =
		airports[
			airports.findIndex(
				(item) => item.iata_code == searchParams.get("from")
			)
		].city;
	useEffect(() => {
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		setFromCity(airports.findIndex((item) => item.iata_code == from));
		setToCity(airports.findIndex((item) => item.iata_code == to));
		setDepartureDate(new dayjs(searchParams.get("date")));
		setTravellers(searchParams.get("travellers") - 1);
	}, []);
	useEffect(() => {
		searchBookings();
		setPageNumber(1);
	}, [location]);
	const priceLabelFormat = (x) =>
		"₹" +
		(x < 1000
			? x
			: Math.floor(x / 1000) + "," + ("" + (x % 1000)).padStart(3, "0"));
	function validateAndFetch() {
		handleResetFilters();
		const from = fromRef.current.querySelector("input").value.slice(0, 3);
		const to = toRef.current.querySelector("input").value.slice(0, 3);
		if (to == from) {
			setErrorMessage("Form City & To City Can't be same!");
			setAnchorEl(fromRef.current);
			return;
		}
		const depDate = departureRef.current.value;
		if (!departureDate) {
			setErrorMessage("Please Enter A Date!");
			setAnchorEl(departureRef.current);
			return;
		}
		if (departureDate.$d == "Invalid Date") {
			setErrorMessage("Please Enter A Valid Date!");
			setAnchorEl(departureRef.current);
			return;
		}
		const isInThePast =
			departureDate.diff(new dayjs().hour(0).minute(0)) < 0;
		const isItMoreThanAYear =
			departureDate.diff(new dayjs().add(-1, "day").add(1, "year")) > 0;
		if (isInThePast < 0 || isItMoreThanAYear) {
			setErrorMessage("Date is out of Range!");
			setAnchorEl(departureRef.current);
			return;
		}
		const pass = passengerRef.current.querySelector("input").value.at(0);
		setPageNumber(1);
		let url = `/flights/search?date=${departureDate.toJSON()}&from=${from}&to=${to}&travellers=${pass}`;
		navigate(url);
	}
	function removeError() {
		setErrorMessage("");
		setAnchorEl(null);
	}
	function handleFilters() {
		setWithFilters(true);
		setPageNumber(1);
		let newData = [...data];
		if (stops < 2) {
			newData = newData.filter((item) => item.stops <= stops);
		}
		if (alignment == "early-morning")
			newData = newData.filter(
				(item) =>
					item.departureTime >= "00:00" &&
					item.departureTime <= "06:00"
			);
		if (alignment == "morning")
			newData = newData.filter(
				(item) =>
					item.departureTime >= "06:00" &&
					item.departureTime <= "12:00"
			);
		if (alignment == "mid-day")
			newData = newData.filter(
				(item) =>
					item.departureTime >= "12:00" &&
					item.departureTime <= "18:00"
			);
		if (alignment == "night")
			newData = newData.filter(
				(item) =>
					item.departureTime >= "18:00" &&
					item.departureTime <= "24:00"
			);
		if (Object.values(airlines).includes(true)) {
			newData = newData.filter(
				(item) => airlines[item.flightID.slice(0, 2)]
			);
		}
		newData = newData.filter((item) => item.ticketPrice <= price);
		switch (sortingMethod) {
			case "cheapest":
				newData.sort((a, b) => a.ticketPrice - b.ticketPrice);
				break;
			case "quickest":
				newData.sort((a, b) => a.duration - b.duration);
				break;
			case "earliest":
				newData.sort((a, b) => {
					const aTime =
						+a.departureTime.slice(0, 2) * 60 +
						+a.departureTime.slice(3, 5);
					const bTime =
						+b.departureTime.slice(0, 2) * 60 +
						+b.departureTime.slice(3, 5);
					return aTime - bTime;
				});
				break;
			default:
				break;
		}
		setFilteredData(newData);
	}
	function handleResetFilters() {
		setWithFilters(false);
		setStops(2);
		setAlignment(null);
		setAirlines({
			"6E": false,
			AI: false,
			UK: false,
			SG: false,
			G8: false,
		});
		setPrice(2500);
	}
	return (
		<Box sx={{ mt: 8.2 }}>
			<Stack
				direction={"row"}
				justifyContent={"center"}
				alignItems={"center"}
				className="search-pannel"
				gap={4}
				sx={{
					background: "linear-gradient(45deg,#721053,#AD2E41)",
					py: 4,
				}}
			>
				<ControlledCustomInput
					removeError={removeError}
					label="From"
					placeholder="Enter city or airport"
					value={fromCity}
					setValue={setFromCity}
					ref={fromRef}
				></ControlledCustomInput>
				<IconButton
					onClick={() => {
						setFromCity(toCity);
						setToCity(fromCity);
					}}
					disableRipple
					sx={{
						mx: 1,
						p: 0.2,
						height: "fit-content",
						border: "2px solid white",
					}}
				>
					<img src={swapSVG} color="#fff" />
				</IconButton>
				<ControlledCustomInput
					removeError={removeError}
					label="To"
					placeholder="Enter city or airport"
					value={toCity}
					setValue={setToCity}
					ref={toRef}
				></ControlledCustomInput>
				<DatePicker
					ref={departureRef}
					sx={{ width: 200 }}
					slotProps={{
						textField: {
							variant: "standard",
							InputLabelProps: { shrink: true },
						},
						inputAdornment: {
							sx: { "& svg": { fill: "white" } },
						},
					}}
					disablePast
					label="Departure"
					reduceAnimations
					maxDate={new dayjs().add(-1, "day").add(1, "year")}
					value={departureDate}
					onChange={(val) => {
						setDepartureDate(val);
						setAnchorEl(null);
					}}
				/>
				<ControlledCustomInput
					removeError={removeError}
					label="Travellers"
					placeholder="Number of Travellers"
					value={travellers}
					setValue={setTravellers}
					type="number"
					ref={passengerRef}
				></ControlledCustomInput>
				<Button
					sx={{
						color: "#fff",
						py: 1,
						px: 7,
						fontWeight: 700,
						fontSize: "16px",
						borderRadius: "2px",
						backgroundColor: "secondary.hover",
						":hover": { backgroundColor: "secondary.hover" },
					}}
					onClick={validateAndFetch}
				>
					Search
				</Button>
				<Popper
					placement="bottom-start"
					open={anchorEl != null}
					anchorEl={anchorEl}
					sx={{ zIndex: 2000 }}
				>
					<Box sx={{ ...popperSX }}>
						{errorMesaage}{" "}
						<BiSolidError
							size="17px"
							style={{ marginLeft: "5px" }}
						/>
					</Box>
				</Popper>
			</Stack>
			<Stack
				className="filter-options"
				direction="row"
				divider={<Divider orientation="vertical" flexItem />}
				gap={2}
				sx={{
					py: 2,
					px: 2,
					backgroundColor: "#fff",
					boxShadow: "0 0 5px rgba(0,0,0,0.15)",
				}}
				justifyContent={"center"}
			>
				<Stack>
					<Typography>Stops</Typography>
					<FormGroup sx={{ flexDirection: "column" }}>
						<FormControlLabel
							control={
								<Checkbox
									disableRipple
									checked={stops == 2}
									onClick={() => setStops(2)}
								/>
							}
							label="1+ Stops"
						/>
						<FormControlLabel
							control={
								<Checkbox
									disableRipple
									checked={stops == 1}
									onClick={() => setStops(1)}
								/>
							}
							label="1 Stop"
						/>
						<FormControlLabel
							control={
								<Checkbox
									disableRipple
									checked={stops == 0}
									onClick={() => setStops(0)}
								/>
							}
							label="Non Stop"
						/>
					</FormGroup>
				</Stack>
				<Stack>
					<Typography>Departure From {displayFromCity}</Typography>
					<ToggleButtonGroup
						variant="small"
						color="primary"
						sx={{
							mt: 2,
							// gap: 1,
							"& button:hover": {
								color: "#ec5b24",
								bgcolor: "rgba(236, 91, 36, 0.08)",
							},
							"& button.Mui-selected": {
								color: "white",
								bgcolor: "#ec5b24",
							},
							"& button.Mui-selected:hover": {
								color: "white",
								bgcolor: "#ec5b24",
							},
						}}
						value={alignment}
						exclusive
						onChange={handleChange}
					>
						<ToggleButton
							sx={{
								fontSize: "12px",
							}}
							disableRipple
							value="early-morning"
						>
							00:00 - 06:00
							<br />
							Early Morning
						</ToggleButton>
						<ToggleButton
							sx={{ fontSize: "12px" }}
							disableRipple
							value="morning"
						>
							06:00 - 12:00
							<br />
							Morning
						</ToggleButton>
						<ToggleButton
							sx={{ fontSize: "12px" }}
							disableRipple
							value="mid-day"
						>
							12:00 - 18:00
							<br />
							Mid Day
						</ToggleButton>
						<ToggleButton
							sx={{ fontSize: "12px" }}
							disableRipple
							value="night"
						>
							18:00 - 24:00
							<br />
							Night
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
				<Stack>
					<Typography>Airlines</Typography>
					<Grid2 container spacing={0} sx={{ width: "250px" }}>
						{airlinesInfo.map(({ name, key }) => {
							return (
								<Grid2 xs={6} key={key}>
									<FormControlLabel
										control={
											<Checkbox
												size="small"
												checked={airlines[key]}
												onClick={() =>
													setAirlines((prev) => {
														const newAirlines = {
															...prev,
														};
														newAirlines[key] =
															!prev[key];
														return newAirlines;
													})
												}
											/>
										}
										label={
											<Typography fontSize={"14px"}>
												{name}
											</Typography>
										}
									/>
								</Grid2>
							);
						})}
					</Grid2>
				</Stack>
				<Stack>
					<Typography>
						Max Price:{" "}
						<span style={{ color: "#ec5b24" }}>
							{priceLabelFormat(price)}
						</span>
					</Typography>
					<Box sx={{ width: 300 }}>
						<Slider
							sx={{
								".MuiSlider-markLabel": {
									fontSize: "12px",
								},
								ml: 2,
							}}
							defaultValue={2500}
							max={2500}
							min={2000}
							step={1}
							onChangeCommitted={(e, v) => setPrice(v)}
							valueLabelFormat={priceLabelFormat}
							valueLabelDisplay="auto"
							marks={[
								{ label: "₹2,000", value: 2000 },
								{ label: "₹2,125", value: 2125 },
								{ label: "₹2,250", value: 2250 },
								{ label: "₹2,375", value: 2375 },
								{ label: "₹2,500", value: 2500 },
							]}
						/>
					</Box>

					<Stack
						className="filter-options"
						alignItems={"center"}
						justifyContent="center"
						flexDirection={"row"}
						sx={{ mt: 1 }}
						gap={2}
					>
						<Button
							onClick={handleFilters}
							disableRipple
							variant="contained"
							sx={{ px: 4, fontWeight: 700 }}
						>
							Apply
						</Button>
						<Button onClick={handleResetFilters}>
							Reset Filters
						</Button>
						<FormControl sx={{ width: "150px", p: 0 }}>
							<InputLabel>Sort</InputLabel>
							<Select
								MenuProps={{
									disableScrollLock: true,
								}}
								value={sortingMethod}
								label="Sort : "
								onChange={(e) =>
									setSortingMethod(e.target.value)
								}
								sx={{
									fontSize: "12px",
									fontWeight: 600,
									color: "#ec5b24",
								}}
							>
								{sortingMethodsList.map(({ name, value }) => {
									return (
										<MenuItem
											value={value}
											key={value}
											sx={{ fontSize: 12 }}
										>
											{name}
										</MenuItem>
									);
								})}
							</Select>
						</FormControl>
					</Stack>
				</Stack>
			</Stack>
			{/* <span class="loader"></span> */}
			<Stack gap={2} sx={{ pt: 2 }} className="data-container">
				{((withfilters && filteredData.length == 0) ||
					(!withfilters && data.length == 0)) && (
					<Stack alignItems={"center"} gap={2} sx={{ my: 2 }}>
						<img src={notFound} style={{ width: "800px" }} />
						<Typography color="rgba(0,0,0,.64)" fontSize={20}>
							Oops! No matches for the applied filters
						</Typography>
						<Typography color="rgba(0,0,0,.64)" fontSize={14}>
							Try applying a different set of filters and search
							again.
						</Typography>
						<Button
							onClick={handleResetFilters}
							disableRipple
							variant="contained"
							sx={{ px: 4, fontWeight: 700 }}
						>
							RESET FILTERS
						</Button>
						{/* </Box> */}
					</Stack>
				)}
				{(withfilters
					? filteredData.slice(
							8 * (pageNumber - 1),
							Math.min(8 * pageNumber, filteredData.length)
					  )
					: data.slice(
							8 * (pageNumber - 1),
							Math.min(8 * pageNumber, data.length)
					  )
				).map((item) => (
					<FlightCard
						key={item._id}
						{...item}
						searchParams={searchParams}
					/>
				))}
				{((withfilters && filteredData.length != 0) ||
					(!withfilters && data.length != 0)) && (
					<Pagination
						color="secondary"
						className="pagination"
						sx={{ alignSelf: "center", m: 2 }}
						page={pageNumber}
						onChange={(e, p) => setPageNumber(p)}
						count={
							withfilters
								? Math.ceil(filteredData.length / 8)
								: Math.ceil(data.length / 8)
						}
						shape="rounded"
					/>
				)}
			</Stack>
		</Box>
	);
}