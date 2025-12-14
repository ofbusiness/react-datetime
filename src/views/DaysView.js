import React from 'react';
import dayjs from 'dayjs';
import ViewNavigation from '../parts/ViewNavigation';

export default class DaysView extends React.Component {
	static defaultProps = {
		isValidDate: () => true,
		renderDay: ( props, date ) => <td { ...props }>{ date.date() }</td>,
	}

	render() {
		return (
			<div className="rdtDays">
				<table>
					<thead>
						{ this.renderNavigation() }
						{ this.renderDayHeaders() }
					</thead>
					<tbody>
						{ this.renderDays() }
					</tbody>
					{ this.renderFooter() }
				</table>
			</div>
		);
	}

	renderNavigation() {
		const date = this.props.viewDate;
		return (
			<ViewNavigation
				onClickPrev={ () => this.props.navigate( -1, 'months' ) }
				onClickSwitch={ () => this.props.showView( 'months' ) }
				onClickNext={ () => this.props.navigate( 1, 'months' ) }
				switchContent={ date.format('MMMM YYYY') }
				switchColSpan={5}
				switchProps={ { 'data-value': this.props.viewDate.month() } }
			/>
		);
	}

	renderDayHeaders() {
		let dayItems = getDaysOfWeek().map( (day, index) => (
			<th key={ day + index } className="dow">{ day }</th>
		));

		return (
			<tr>
				{ dayItems }
			</tr>
		);
	}

	renderDays() {
		// Ensure we have a valid Day.js object
		let date = this.props.viewDate;
		if (!date) {
			date = dayjs();
		}

		// Convert to Day.js if it's not already
		if (!dayjs.isDayjs(date)) {
			date = dayjs(date);
		}

		const startOfMonth = date.startOf('month');
		const endOfMonth = date.endOf('month');

		// We need 42 days in 6 rows starting from the last week of the previous month
		let rows = [[], [], [], [], [], []];

		// Get the first day to show (last week of previous month that contains current month)
		let startDate = date.subtract( 1, 'months').endOf('month').startOf('week');
		let endDate = startDate.add( 42, 'd' );
		let dayIndex = 0;

		while ( dayIndex < 42 ) {
			let rowIndex = Math.floor( dayIndex / 7 );
			let row = rows[rowIndex];

			if (row) {
				row.push( this.renderDay( startDate, startOfMonth, endOfMonth ) );
			}

			startDate = startDate.add( 1, 'd' );
			dayIndex++;
		}

		return rows.map( (r, i) => (
			<tr key={ `days_${i}` }>{ r }</tr>
		));
	}

	renderDay( date, startOfMonth, endOfMonth ) {
		let selectedDate = this.props.selectedDate;

		let dayProps = {
			key: date.format('M_D'),
			'data-value': date.date(),
			'data-month': date.month(),
			'data-year': date.year()
		};

		let className = 'rdtDay';
		if ( date.isBefore( startOfMonth ) ) {
			className += ' rdtOld';
		}
		else if ( date.isAfter( endOfMonth ) ) {
			className += ' rdtNew';
		}
		if ( selectedDate && date.isSame( selectedDate, 'day' ) ) {
			className += ' rdtActive';
		}
		if ( date.isSame( dayjs(), 'day' ) ) {
			className += ' rdtToday';
		}

		if ( this.props.isValidDate(date) ) {
			dayProps.onClick = this._setDate;
		}
		else {
			className += ' rdtDisabled';
		}

		dayProps.className = className;

		return this.props.renderDay(
			dayProps, date.clone(), selectedDate && selectedDate.clone()
		);
	}

	renderFooter() {
		if ( !this.props.timeFormat ) return;

		const date = this.props.viewDate;
		return (
			<tfoot>
				<tr>
					<td onClick={ () => this.props.showView('time') }
						colSpan={7}
						className="rdtTimeToggle">
						{ date.format( this.props.timeFormat ) }
					</td>
				</tr>
			</tfoot>
		);
	}

	_setDate = e => {
		this.props.updateDate( e );
	}
}

function getRow( rows, day ) {
	return rows[ Math.floor( day / 7 ) ];
}

/**
 * Get a list of the days of the week
 * depending on the current locale
 * @return {array} A list with the shortname of the days
 */
function getDaysOfWeek() {
	// Use Day.js locale data if available, otherwise default to English
	let weekdaysMin;
	let firstDayOfWeek = 0; // Default to Sunday

	try {
		const localeData = dayjs().locale();
		if (localeData && localeData.weekdaysMin) {
			weekdaysMin = localeData.weekdaysMin;
			if (localeData.weekStart !== undefined) {
				firstDayOfWeek = localeData.weekStart;
			}
		}
	} catch (e) {
		// Fallback to default if locale data not available
	}

	// Fallback to English if no locale data found
	if (!weekdaysMin) {
		weekdaysMin = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	}

	let dow = [];
	let i = 0;

	weekdaysMin.forEach(function (day) {
		dow[(7 + (i++) - firstDayOfWeek) % 7] = day;
	});

	return dow;
}
