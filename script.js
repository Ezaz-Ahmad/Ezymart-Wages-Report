const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let wageDetails = days.map(day => ({ day, shifts: [{ startTime: null, endTime: null, location: 'Gosford' }] }));

document.addEventListener('DOMContentLoaded', () => {
    const shiftsContainer = document.getElementById('shifts-container');
    
    // Load saved data from localStorage
    const savedWageDetails = localStorage.getItem('wageDetails');
    if (savedWageDetails) {
        wageDetails = JSON.parse(savedWageDetails);
    }

    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'shift-container';
        dayDiv.id = `shift-container-${day}`;
        dayDiv.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="check-${day}" onchange="toggleDay('${day}', this.checked)">
                <label for="check-${day}">${day}</label>
            </div>
            <div id="shifts-${day}" class="shifts-list"></div>
            <button class="btn-add-shift" id="add-shift-${day}" onclick="addShift('${day}')" disabled>Add Shift</button>
        `;
        shiftsContainer.appendChild(dayDiv);

        // Populate saved shifts into the UI
        const dayData = wageDetails.find(d => d.day === day);
        const shiftsList = document.getElementById(`shifts-${day}`);
        const checkBox = document.getElementById(`check-${day}`);
        const addShiftBtn = document.getElementById(`add-shift-${day}`);

        dayData.shifts.forEach((shift, index) => {
            const shiftDiv = createShiftInputs(day, index, shift);
            shiftsList.appendChild(shiftDiv);

            if (shift.startTime || shift.endTime) {
                checkBox.checked = true;
                addShiftBtn.disabled = false;
                toggleShiftInputs(day, index, true);
            }
        });
    });
});

function createShiftInputs(day, index, shift) {
    const shiftDiv = document.createElement('div');
    shiftDiv.className = 'shift-entry';
    shiftDiv.innerHTML = `
        <div class="form-group">
            <label for="start-${day}-${index}">Start Time:</label>
            <input type="time" id="start-${day}-${index}" disabled onchange="updateShift('${day}', ${index}, 'startTime', this.value)">
        </div>
        <div class="form-group">
            <label for="end-${day}-${index}">End Time:</label>
            <input type="time" id="end-${day}-${index}" disabled onchange="updateShift('${day}', ${index}, 'endTime', this.value)">
        </div>
        <div class="form-group">
            <label for="loc-${day}-${index}">Location:</label>
            <select id="loc-${day}-${index}" disabled onchange="updateShift('${day}', ${index}, 'location', this.value)">
                <option value="Gosford">Gosford</option>
                <option value="Islington">Islington</option>
                <option value="Adamstown">Adamstown</option>
            </select>
        </div>
        <button class="btn-remove-shift" onclick="removeShift('${day}', ${index})" disabled>Remove Shift</button>
    `;
    const startInput = shiftDiv.querySelector(`#start-${day}-${index}`);
    const endInput = shiftDiv.querySelector(`#end-${day}-${index}`);
    const locSelect = shiftDiv.querySelector(`#loc-${day}-${index}`);
    const removeBtn = shiftDiv.querySelector('.btn-remove-shift');
    startInput.value = shift.startTime || '';
    endInput.value = shift.endTime || '';
    locSelect.value = shift.location || 'Gosford';
    // Disable remove button for the first shift to ensure at least one shift remains
    if (index === 0) removeBtn.style.display = 'none';
    return shiftDiv;
}

function addShift(day) {
    const dayData = wageDetails.find(d => d.day === day);
    const newShift = { startTime: null, endTime: null, location: 'Gosford' };
    dayData.shifts.push(newShift);
    const shiftsList = document.getElementById(`shifts-${day}`);
    const index = dayData.shifts.length - 1;
    const shiftDiv = createShiftInputs(day, index, newShift);
    shiftsList.appendChild(shiftDiv);
    toggleShiftInputs(day, index, true);
    localStorage.setItem('wageDetails', JSON.stringify(wageDetails));
}

function removeShift(day, index) {
    const dayData = wageDetails.find(d => d.day === day);
    if (dayData.shifts.length > 1) { // Prevent removing the last shift
        dayData.shifts.splice(index, 1);
        const shiftsList = document.getElementById(`shifts-${day}`);
        shiftsList.innerHTML = ''; // Clear and re-render shifts
        dayData.shifts.forEach((shift, newIndex) => {
            const shiftDiv = createShiftInputs(day, newIndex, shift);
            shiftsList.appendChild(shiftDiv);
            toggleShiftInputs(day, newIndex, true);
        });
        localStorage.setItem('wageDetails', JSON.stringify(wageDetails));
    }
}

function toggleShiftInputs(day, index, enabled) {
    const startInput = document.getElementById(`start-${day}-${index}`);
    const endInput = document.getElementById(`end-${day}-${index}`);
    const locSelect = document.getElementById(`loc-${day}-${index}`);
    const removeBtn = document.querySelector(`#shifts-${day} .shift-entry:nth-child(${index + 1}) .btn-remove-shift`);
    startInput.disabled = !enabled;
    endInput.disabled = !enabled;
    locSelect.disabled = !enabled;
    if (removeBtn) removeBtn.disabled = !enabled;
}

function showCalculator() {
    const landingPage = document.getElementById('landing-page');
    const calculatorPage = document.getElementById('calculator-page');

    // Remove active class from landing page and hide it completely
    landingPage.classList.remove('active');
    landingPage.style.display = 'none'; // Explicitly hide it

    // Show calculator page and make it active
    calculatorPage.style.display = 'block'; // Ensure it’s visible
    calculatorPage.classList.add('active');

    // Prevent scrolling on the body when transitioning
    document.body.style.overflow = 'auto'; // Allow scrolling on calculator page
}

function toggleDay(day, checked) {
    const dayData = wageDetails.find(d => d.day === day);
    const addShiftBtn = document.getElementById(`add-shift-${day}`);
    addShiftBtn.disabled = !checked;

    dayData.shifts.forEach((_, index) => {
        toggleShiftInputs(day, index, checked);
        if (!checked) {
            dayData.shifts[index] = { startTime: null, endTime: null, location: 'Gosford' };
            document.getElementById(`start-${day}-${index}`).value = '';
            document.getElementById(`end-${day}-${index}`).value = '';
            document.getElementById(`loc-${day}-${index}`).value = 'Gosford';
        }
    });

    if (checked && dayData.shifts.length === 0) {
        addShift(day); // Add initial shift if none exist
    }
    localStorage.setItem('wageDetails', JSON.stringify(wageDetails));
}

function updateShift(day, index, field, value) {
    const dayData = wageDetails.find(d => d.day === day);
    if (field === 'startTime' || field === 'endTime') {
        dayData.shifts[index][field] = value;
    } else {
        dayData.shifts[index][field] = value;
    }
    // Save updated wageDetails to localStorage
    localStorage.setItem('wageDetails', JSON.stringify(wageDetails));
}

function calculateDuration(start, end) {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    let [endH, endM] = end.split(':').map(Number);
    if (endH < startH || (endH === startH && endM < startM)) endH += 24;
    return (endH * 60 + endM - (startH * 60 + startM)) / 60;
}

function getHourlyRate(day, startTime) {
    const isWeekend = day === 'Friday' || day === 'Saturday' || 
        (day === 'Sunday' && (!startTime || parseInt(startTime.split(':')[0]) < 6));
    return isWeekend ? 
        parseFloat(document.getElementById('weekend-rate').value) : 
        parseFloat(document.getElementById('weekday-rate').value);
}

function calculateWages() {
    const form = document.getElementById('wages-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let totalHours = 0, totalFuelCost = 0, grandTotalWages = 0;

    wageDetails.forEach(day => {
        day.shifts.forEach(shift => {
            if (shift.startTime && shift.endTime) {
                const duration = calculateDuration(shift.startTime, shift.endTime);
                const rate = getHourlyRate(day.day, shift.startTime);
                const earnings = duration * rate;
                totalHours += duration;
                if (shift.location === 'Gosford') {
                    totalFuelCost += parseFloat(document.getElementById('fuel-cost').value);
                }
                grandTotalWages += earnings;
            }
        });
    });

    const others = parseFloat(document.getElementById('others').value) || 0;
    const taxAmount = parseFloat(document.getElementById('tax-amount').value);
    grandTotalWages += totalFuelCost + others - taxAmount;
    const grandTotalBeforeTax = grandTotalWages + taxAmount;
    const closingAmount = parseFloat(document.getElementById('closing-amount').value) || 0;
    const wagesLeftOver = closingAmount - grandTotalWages;

    showResults({
        date: document.getElementById('date').value,
        employeeName: document.getElementById('employee-name').value,
        employeeAddress: document.getElementById('employee-address').value,
        totalHours,
        totalFuelCost,
        others,
        grandTotalBeforeTax,
        taxAmount,
        grandTotalWages,
        closingAmount,
        wagesLeftOver
    });
}
function showResults(data) {
    const content = document.getElementById('result-content');
    content.innerHTML = `
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Employee Name:</strong> ${data.employeeName}</p>
        <p><strong>Employee Address:</strong> ${data.employeeAddress}</p>
        <p><strong>Total Hours Worked:</strong> ${data.totalHours.toFixed(2)}</p>
        <p><strong>Fuel Cost:</strong> $${data.totalFuelCost.toFixed(2)}</p>
        <p><strong>Other Expenses:</strong> $${data.others.toFixed(2)}</p>
        <p><strong>Grand Total Wages (Before Transfer):</strong> $${data.grandTotalBeforeTax.toFixed(2)}</p>
        <p><strong>Transferred Amount:</strong> $${data.taxAmount.toFixed(2)}</p>
        <p><strong>Grand Total Wages (After Transfer):</strong> $${data.grandTotalWages.toFixed(2)}</p>
        <p><strong>Closing Amount:</strong> $${data.closingAmount.toFixed(2)}</p>
        <p><strong>Wages Left Over:</strong> $${data.wagesLeftOver.toFixed(2)}</p>
    `;
    document.getElementById('result-modal').style.display = 'block';
}

async function saveAsPDF() {
    const overlay = document.getElementById('wave-overlay');
    overlay.style.display = 'flex';

    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const formData = {
        date: document.getElementById('date').value || 'N/A',
        employeeName: document.getElementById('employee-name').value || 'Unknown',
        employeeAddress: document.getElementById('employee-address').value || 'N/A',
        weekdayRate: parseFloat(document.getElementById('weekday-rate').value) || 0,
        weekendRate: parseFloat(document.getElementById('weekend-rate').value) || 0,
        fuelCost: parseFloat(document.getElementById('fuel-cost').value) || 0,
        others: parseFloat(document.getElementById('others').value) || 0,
        expenseExplanation: document.getElementById('expense-explanation').value || 'No additional expenses.',
        taxAmount: parseFloat(document.getElementById('tax-amount').value) || 0,
        pouchDay: document.getElementById('pouch-day').value || 'N/A',
        pouchDate: document.getElementById('pouch-date').value || 'N/A',
        closingAmount: parseFloat(document.getElementById('closing-amount').value) || 0
    };

    let totalHours = 0, totalFuelCost = 0, grandTotalWages = 0;

    wageDetails.forEach(day => {
        day.shifts.forEach(shift => {
            if (shift.startTime && shift.endTime) {
                const duration = calculateDuration(shift.startTime, shift.endTime);
                const rate = getHourlyRate(day.day, shift.startTime);
                const earnings = duration * rate;
                totalHours += duration;
                if (shift.location === 'Gosford') {
                    totalFuelCost += formData.fuelCost;
                }
                grandTotalWages += earnings;
            }
        });
    });

    grandTotalWages += totalFuelCost + formData.others - formData.taxAmount;
    const grandTotalBeforeTax = grandTotalWages + formData.taxAmount;
    const wagesLeftOver = formData.closingAmount - grandTotalWages;
    // Page 1 Setup
    const page1 = pdfDoc.addPage([595, 842]); // A4 size in points
    let y = page1.getHeight() - 40;

    const drawText = (text, x, yPos, options = {}) => {
        const { bold = false, color = rgb(0, 0, 0), size = 12, lineHeight = 15, maxWidth = 515 } = options;
        page1.drawText(text, { 
            x, 
            y: yPos, 
            font: bold ? boldFont : font, 
            size, 
            color,
            maxWidth
        });
        return yPos - lineHeight;
    };

    // Header
    page1.drawRectangle({
        x: 0,
        y: page1.getHeight() - 70,
        width: page1.getWidth(),
        height: 70,
        color: rgb(0, 0.48, 1), // Blue (#007bff)
    });
    y = drawText('EzyMart Wages Report', 40, page1.getHeight() - 35, { size: 24, color: rgb(1, 1, 1), bold: true });
    page1.drawLine({
        start: { x: 40, y: page1.getHeight() - 75 },
        end: { x: 555, y: page1.getHeight() - 75 },
        thickness: 2,
        color: rgb(0, 0.76, 0.8), // Teal (#00c4cc)
    });
    y = page1.getHeight() - 90;

    // Employee Information
    y = drawText('Employee Information', 40, y, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
    y = drawText(`Date: ${formData.date}`, 40, y, { size: 12 });
    y = drawText(`Employee Name: ${formData.employeeName}`, 40, y, { size: 12 });
    y = drawText(`Address: ${formData.employeeAddress}`, 40, y, { size: 12, lineHeight: 20 });

    // Hourly Rates (Right Column)
    let rightColumnY = page1.getHeight() - 90;
    rightColumnY = drawText('Hourly Rates', 320, rightColumnY, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
    rightColumnY = drawText(`Weekday: $${formData.weekdayRate.toFixed(2)}`, 320, rightColumnY, { size: 12 });
    rightColumnY = drawText(`Weekend: $${formData.weekendRate.toFixed(2)}`, 320, rightColumnY, { size: 12, lineHeight: 20 });
    // Work Schedule Table
y -= 10;
y = drawText('Work Schedule', 40, y, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
page1.drawRectangle({ x: 40, y: y - 5, width: 515, height: 20, color: rgb(0.95, 0.95, 0.95) });
y = drawText('Day', 45, y, { bold: true, size: 10 });
drawText('Start', 120, y + 15, { bold: true, size: 10 });
drawText('End', 190, y + 15, { bold: true, size: 10 });
drawText('Location', 260, y + 15, { bold: true, size: 10 });
drawText('Hours', 360, y + 15, { bold: true, size: 10 });
drawText('Earnings', 430, y + 15, { bold: true, size: 10 });

   // Adjust y for the table content
y -= 20; // Move down after the header row

wageDetails.forEach(day => {
    day.shifts.forEach(shift => {
        if (shift.startTime && shift.endTime) {
            const duration = calculateDuration(shift.startTime, shift.endTime);
            const earnings = duration * getHourlyRate(day.day, shift.startTime);
            y = drawText(day.day, 45, y, { size: 10, lineHeight: 15 });
            drawText(shift.startTime, 120, y + 15, { size: 10, lineHeight: 15 });
            drawText(shift.endTime, 190, y + 15, { size: 10, lineHeight: 15 });
            drawText(shift.location, 260, y + 15, { size: 10, lineHeight: 15 });
            drawText(duration.toFixed(2), 360, y + 15, { size: 10, lineHeight: 15 });
            drawText(`$${earnings.toFixed(2)}`, 430, y + 15, { size: 10, lineHeight: 15 });
            y -= 15; // Move down for the next row
        }
    });
});

    // Summary
y -= 10;
y = drawText('Summary', 40, y, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
y = drawText(`Total Hours: ${totalHours.toFixed(2)}`, 40, y, { size: 12 });
y = drawText(`Fuel Cost: $${totalFuelCost.toFixed(2)}`, 40, y, { size: 12 });
y = drawText(`Other Expenses: $${formData.others.toFixed(2)}`, 40, y, { size: 12, lineHeight: 20 });
// Financial Summary (Right Column)
// Start Financial Summary below the Work Schedule and Summary sections
rightColumnY = Math.min(rightColumnY, y - 20); // Ensure it starts below the Summary section
rightColumnY = drawText('Financial Summary', 320, rightColumnY, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
rightColumnY = drawText(`Total Before Tax: $${grandTotalBeforeTax.toFixed(2)}`, 320, rightColumnY, { size: 12, bold: true, color: rgb(0.6, 0, 0) });
rightColumnY = drawText(`Tax/Transferred: $${formData.taxAmount.toFixed(2)}`, 320, rightColumnY, { size: 12, bold: true, color: rgb(0, 0, 0.6) });
rightColumnY = drawText(`Total After Tax: $${grandTotalWages.toFixed(2)}`, 320, rightColumnY, { size: 12, bold: true, color: rgb(0.6, 0, 0) });
rightColumnY = drawText(`Closing Amount: $${formData.closingAmount.toFixed(2)}`, 320, rightColumnY, { size: 12 });
rightColumnY = drawText(`AMOUNT LEFT AFTER SORTING: $${wagesLeftOver.toFixed(2)}`, 320, rightColumnY, { size: 12, bold: true, lineHeight: 20 });

    // Footer Page 1
    page1.drawRectangle({
        x: 0,
        y: 20,
        width: page1.getWidth(),
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
    });
    page1.drawText('Developed by Ezaz Ahmad | Version: 1.1.3V | Page 1 of 2', {
        x: 40,
        y: 30,
        font,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
    });

    // Page 2 Setup
    const page2 = pdfDoc.addPage([595, 842]);
    y = page2.getHeight() - 40;

    const drawTextPage2 = (text, x, yPos, options = {}) => {
        const { bold = false, color = rgb(0, 0, 0), size = 12, lineHeight = 15, maxWidth = 515 } = options;
        page2.drawText(text, { 
            x, 
            y: yPos, 
            font: bold ? boldFont : font, 
            size, 
            color,
            maxWidth
        });
        return yPos - lineHeight;
    };

    // Header Page 2
    page2.drawRectangle({
        x: 0,
        y: page2.getHeight() - 70,
        width: page2.getWidth(),
        height: 70,
        color: rgb(0, 0.48, 1),
    });
    y = drawTextPage2('Additional Notes', 40, page2.getHeight() - 35, { size: 24, color: rgb(1, 1, 1), bold: true });
    page2.drawLine({
        start: { x: 40, y: page2.getHeight() - 75 },
        end: { x: 555, y: page2.getHeight() - 75 },
        thickness: 2,
        color: rgb(0, 0.76, 0.8),
    });
    y = page2.getHeight() - 90;

    // Notes Content
    y = drawTextPage2('Expense Explanation', 40, y, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
    y = drawTextPage2(formData.expenseExplanation, 40, y, { size: 12, lineHeight: 18 });
    y -= 10;
    y = drawTextPage2('Closing Amount Details', 40, y, { size: 16, color: rgb(0, 0.48, 1), bold: true, lineHeight: 20 });
    y = drawTextPage2(`Closing Amount Day and Date: ${formData.pouchDay} (${formData.pouchDate})`, 40, y, { size: 12, lineHeight: 20 });
    y = drawTextPage2(`Closing Amount: $${formData.closingAmount.toFixed(2)}. Wages left after transfer: $${grandTotalWages.toFixed(2)}.`, 40, y, { size: 12, lineHeight: 20 });
    y = drawTextPage2(`MONEY LEFT AFTER SORTING THE WAGES: $${formData.closingAmount.toFixed(2)} - $${grandTotalWages.toFixed(2)} = $${wagesLeftOver.toFixed(2)}`, 40, y, { size: 12, bold: true, lineHeight: 20 });
    y = drawTextPage2(`The remaining amount has been left in the usual place for Gosford’s closing money.`, 40, y, { size: 12, lineHeight: 20 });

    // Footer Page 2
    page2.drawRectangle({
        x: 0,
        y: 20,
        width: page2.getWidth(),
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
    });
    page2.drawText('Developed by Ezaz Ahmad | Version: 1.1.3V | Page 2 of 2', {
        x: 40,
        y: 30,
        font,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();

    setTimeout(() => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${formData.employeeName}_WagesReport_${formData.date}.pdf`;
        link.click();
        overlay.style.display = 'none';
        closeModal();
        // Clear localStorage after PDF generation
        localStorage.removeItem('wageDetails');
        // Reset wageDetails to initial state
        wageDetails = days.map(day => ({ day, shifts: [{ startTime: null, endTime: null, location: 'Gosford' }] }));
        clearForm(); // Reset the UI
    }, 2000);
}

function closeModal() {
    document.getElementById('result-modal').style.display = 'none';
}

function clearForm() {
    document.getElementById('wages-form').reset();
    wageDetails = days.map(day => ({ day, shifts: [{ startTime: null, endTime: null, location: 'Gosford' }] }));
    days.forEach(day => {
        const shiftsList = document.getElementById(`shifts-${day}`);
        shiftsList.innerHTML = '';
        const dayData = wageDetails.find(d => d.day === day);
        const shiftDiv = createShiftInputs(day, 0, dayData.shifts[0]);
        shiftsList.appendChild(shiftDiv);
        document.getElementById(`check-${day}`).checked = false;
        toggleShiftInputs(day, 0, false);
        document.getElementById(`add-shift-${day}`).disabled = true;
    });
    document.getElementById('expense-explanation').disabled = true;
    // Clear localStorage
    localStorage.removeItem('wageDetails');
}

document.getElementById('others').addEventListener('input', (e) => {
    document.getElementById('expense-explanation').disabled = !e.target.value || e.target.value === '0';
});
