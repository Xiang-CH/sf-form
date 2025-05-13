import * as XLSX from 'xlsx-js-style';
import { Form } from '../types';

const borderStyle = {
  top: { style: "thin" },
  bottom: { style: "thin"},
  left: { style: "thin" },
  right: { style: "thin"}
}

export const exportFormToExcel = (form: Form): void => {
  // Define the column headers for the main data table.
  // This helps us calculate the number of columns used by the table.
  const tableHeaders = [
    '',
    '',
    '是否按照订单\n地址妥投',
    '订单派送地址是否\n为三方',
    '是否有客户交互\n（是否见到本人）',
    '客户是否有\n寄件',
    '如有电退是否\n有客户交互',
    ''
  ];

  // Calculate the number of columns based on the table headers
  const numColumns = tableHeaders.length; // Should be 8 columns (A-H)

  // Create worksheet data
  const worksheetData = [
    // Row 1: Title
    ['末端派送调研表'],

    // Row 2: Instructions
    ['1、跟随小哥收派工作，逐票客观记录小哥末端作业真实情况，不允许干扰小哥正常工作流程及操作，避免影响真实性。\n2、 请与小哥提前知会：该记录数据仅用于内部标准优化数据支撑，运单统计结果匿名制，且不作为标准优化之外的公开或第三方使用（比如考核监控等）。\n3、其他说明：妥投地址“三方”：菜鸟驿站、超市、合作点、丰巢等'],

    // Row 3: City Name (Label in Col A, Value in Col B)
    ['城市名称', '', form.cityName],

    // Row 4: Survey Date (Label in Col A, Value in Col B), Area Type (Label in Col C, Value in Col D)
    ['调研时间', '', form.surveyDate, '', '区域类型\n(工业区/住宅区等)', form.areaType],

    // Row 5: Branch Code (Label in Col A, Value in Col B), Courier Code (Label in Col C, Value in Col D)
    ['网点代码', '', form.branchCode, '', '小哥工号', form.courierCode],

    // Row 6: Header for mandatory options ("以下选项必选 ✓✗")
    // This header spans the columns related to the options below it (Cols C to G)
    ['序号', '运单号后4\n位',  '以下选项必选 “✓✗”', '', '', '','','备注\n（滞留 "z"）'], // This cell will be placed in column C (index 2) by the merge

    // Row 7: Main Table Headers
    tableHeaders,

    // Row 8 onwards: Table Data
    ...form.entries.map((entry, index) => [
      index + 1, // Column A: 序号
      entry.trackingNumberLastFour, // Column B: 运单号后4位
      // Use '✓' or '✗' as seen in the header note, instead of 'Y'/'N'
      entry.addressDelivered ? '✓' : '✗', // Column C: 是否按照订单地址妥投
      entry.thirdPartyDelivery ? '✓' : '✗', // Column D: 订单派送地址是否为三方
      entry.customerInteraction ? '✓' : '✗', // Column E: 是否有客户交互
      entry.customerInteractionSending ? '✓' : '✗', // Column F: 客户是否有寄件
      entry.customerInteractionReturn ? '✓' : '✗', // Column G: 如有电退是否有客户交互
      entry.notes // Column H: 备注
    ])
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Define cell merges
  const merges = [
    // Row 1: Title - merge cells from column 0 across all data columns (0 to 7)
    { s: { r: 0, c: 0 }, e: { r: 0, c: numColumns - 1 } },
    // Row 2: Instructions - merge cells from column 0 across all data columns (0 to 7)
    { s: { r: 1, c: 0 }, e: { r: 1, c: numColumns - 1 } },
    // Row 3: City Name - Label in A, Value in B. No merge needed across columns for these.
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 2, c: 2 }, e: { r: 2, c: numColumns - 1 } },
    // Rows 4 & 5: Metadata - Labels in A & C, Values in B & D. No merge needed across columns for these.
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } },
    // { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } },
    { s: { r: 3, c: 5 }, e: { r: 3, c: numColumns - 1 } },

    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
    // { s: { r: 4, c: 4 }, e: { r: 4, c: 5 } },
    { s: { r: 4, c: 5 }, e: { r: 4, c: numColumns - 1 } },
    // Row 6: "以下选项必选" header - merge from column C (index 2) to column G (index 6)
    { s: { r: 5, c: 2 }, e: { r: 5, c: numColumns - 2 } },
    // Row 6: First two columns and last column
    { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
    { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
    { s: { r: 5, c: numColumns - 1 }, e: { r: 6, c: numColumns - 1 } },
    // Row 7: Table headers - No merges here.
  ];

  // Add the merges to the worksheet
  worksheet['!merges'] = merges;

  // Set column widths based on visual estimation from the screenshot
  const colWidths = [
    { wch: 6 },   // Column A: 序号
    { wch: 10 },  // Column B: 运单号后4位
    { wch: 12 },  // Column C: 是否按照订单地址妥投
    { wch: 16 },  // Column D: 订单派送地址是否为三方
    { wch: 16 },  // Column E: 是否有客户交互（是否见到本人）
    { wch: 10 },  // Column F: 客户是否有寄件
    { wch: 14 },  // Column G: 如有电退是否有客户交互
    { wch: 12 },  // Column H: 备注
  ];
  worksheet['!cols'] = colWidths;

  // Set row heights (approximate based on appearance)
  // Row heights can be tricky as 'hpt' (height in points) needs calibration.
  // Setting some base heights for key rows.
  const rowHeights = [
    { hpt: 20 },  // Row 1: Title row
    { hpt: 100 },  // Row 2: Instructions row (needs wrapText style too)
    { hpt: 24 },  // Row 3: City name row
    { hpt: 34 },  // Row 4: Survey date/area type row
    { hpt: 24 },  // Row 5: Branch/courier code row
    { hpt: 18 },  // Row 6: "以下选项" header row
    { hpt: 32 },  // Row 7: Main table header row
  ];
  // Need to ensure there are enough height entries for data rows if needed,
  // but default height usually works for single-line data unless wrapping occurs.
   worksheet['!rows'] = rowHeights;


  // --- Apply Styling ---

  // Helper function to apply border style to a cell
  const applyBorderStyle = (cellAddress: string) => {
    if (worksheet[cellAddress]) {
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.border = borderStyle;
    }
  };

  // Style the title row (Row 1, index 0)
  const titleCellAddress = XLSX.utils.encode_cell({ r: 0, c: 0 }); // Address of the merged cell start
  if (worksheet[titleCellAddress]) {
    if (!worksheet[titleCellAddress].s) worksheet[titleCellAddress].s = {}; // Initialize style if needed
    worksheet[titleCellAddress].s.font = { name: 'Microsoft YaHei', bold: true, sz: 14 }; // Bold, larger font
    worksheet[titleCellAddress].s.alignment = { horizontal: 'center', vertical: 'center' }; // Centered
    worksheet[titleCellAddress].s.fill = { fgColor: { rgb: "C5D9F1" } };
  }
  for (let c = 0; c < numColumns; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s.border = borderStyle;
    }
  }

  // Style the instructions row (Row 2, index 1)
  const instructionsCellAddress = XLSX.utils.encode_cell({ r: 1, c: 0 }); // Address of the merged cell start
  if (worksheet[instructionsCellAddress]) {
    if (!worksheet[instructionsCellAddress].s) worksheet[instructionsCellAddress].s = {}; // Initialize style if needed
     // Apply wrapText: true and center vertical alignment
    worksheet[instructionsCellAddress].s.alignment = { horizontal: 'left', vertical: 'center', wrapText: true }; // <-- Added wrapText
     // Optional: smaller font for instructions
     worksheet[instructionsCellAddress].s.font = { name: 'Microsoft YaHei', sz: 12 };
     worksheet[instructionsCellAddress].s.border = borderStyle;
  }


  // Style the metadata labels (Rows 3-5, Column A and C)
  const metadataRows = [2, 3, 4]; // 0-based indices for Row 3, 4, 5
  const metadataLabelCols = [0, 4]; // 0-based indices for Column A and C
  metadataRows.forEach(rowIndex => {
    metadataLabelCols.forEach(colIndex => {

       // Only style the label columns where data exists in worksheetData
       if (worksheetData[rowIndex] && worksheetData[rowIndex][colIndex] !== undefined) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (worksheet[cellAddress]) {
                if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}; // Initialize style if needed
                worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', bold: true }; // Bolding labels
                 // Optional: Align labels to the right slightly for separation
                 if (colIndex == 0){
                  worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
                } else {
                  worksheet[cellAddress].s.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
                }
                worksheet[cellAddress].s.border = borderStyle;
            }

       }
    });
    //  Style metadata values (Column B and D) - vertical center alignment
     [2, 5].forEach(colIndex => {
         if (worksheetData[rowIndex] && worksheetData[rowIndex][colIndex] !== undefined) {
              const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
              if (worksheet[cellAddress]) {
                 if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}; // Initialize style if needed
                 worksheet[cellAddress].s.alignment = { vertical: 'center', wrapText: true };
                 worksheet[cellAddress].s.border = borderStyle;
              }
         }
     });
  });


  // Style the "以下选项必选" header (Row 6, index 5)
  const optionsHeaderCellAddress = XLSX.utils.encode_cell({ r: 5, c: 2 }); // Address of the merged cell start
   if (worksheet[optionsHeaderCellAddress]) {
     if (!worksheet[optionsHeaderCellAddress].s) worksheet[optionsHeaderCellAddress].s = {}; // Initialize style if needed
     worksheet[optionsHeaderCellAddress].s.font = { name: 'Microsoft YaHei', bold: true }; // Bold
     worksheet[optionsHeaderCellAddress].s.alignment = { horizontal: 'center', vertical: 'center' }; // Centered
     worksheet[optionsHeaderCellAddress].s.border = borderStyle;
    //  worksheet[optionsHeaderCellAddress].s.fill = { fgColor: { rgb: "E0E0E0" } }; // Light gray background
   }

   [0,1,numColumns - 1].forEach(colIndex => {
    // Only style the label columns where data exists in worksheetData
    if (worksheetData[5] && worksheetData[5][colIndex] !== undefined) {
         const cellAddress = XLSX.utils.encode_cell({ r: 5, c: colIndex });
         if (worksheet[cellAddress]) {
             if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}; // Initialize style if needed
             worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', bold: true }; // Bolding labels
              // Optional: Align labels to the right slightly for separation
              worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true};
              worksheet[cellAddress].s.border = borderStyle;
         }
    }
 });


  // Style the main table header row (Row 7, index 6)
  const tableHeaderRowIndex = 6;
  for (let col = 0; col < numColumns; col++) {
    const cellAddress = XLSX.utils.encode_cell({
      r: tableHeaderRowIndex,
      c: col,
    });
    if (worksheet[cellAddress]) {
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}; // Initialize style if needed
      worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', bold: true }; // Bold
      // Apply wrapText: true and center alignment
      worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true }; // <-- Added wrapText
      worksheet[cellAddress].s.border = borderStyle;
      // worksheet[cellAddress].s.fill = { fgColor: { rgb: "E0E0E0" } }; // Light gray background, matching options header
    }
  }

   // Style the data rows (Row 8 onwards)
  const dataStartRowIndex = 7; // Data starts after the main header row (Row 7, index 6)
  const optionColumns = [2, 3, 4, 5, 6]; // Indices of columns C, D, E, F, G
  const notesColumnIndex = 7; // Index of the '备注' column (Column H)

   for (let i = 0; i < form.entries.length; i++) {
       const rowIndex = dataStartRowIndex + i;

       // Center alignment for option columns
       optionColumns.forEach(colIndex => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (worksheet[cellAddress]) {
                if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}; // Initialize style if needed
                worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' }; // Center alignment
                worksheet[cellAddress].s.border = borderStyle;
            }
       });

        // Center alignment for 序号 (Column A, index 0)
        const seqCellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
         if (worksheet[seqCellAddress]) {
            if (!worksheet[seqCellAddress].s) worksheet[seqCellAddress].s = {}; // Initialize style if needed
            worksheet[seqCellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
            worksheet[seqCellAddress].s.border = borderStyle;
        }

        // Center alignment for 运单号后4位 (Column B, index 1)
        const trackingCellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });
         if (worksheet[trackingCellAddress]) {
            if (!worksheet[trackingCellAddress].s) worksheet[trackingCellAddress].s = {}; // Initialize style if needed
            worksheet[trackingCellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
            worksheet[trackingCellAddress].s.border = borderStyle;
        }

         // Apply wrapText to the '备注' column (Column H, index 7)
         const notesCellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: notesColumnIndex });
         if (worksheet[notesCellAddress]) {
            if (!worksheet[notesCellAddress].s) worksheet[notesCellAddress].s = {}; // Initialize style if needed
            // Keep existing vertical alignment (center) and add wrapText
            worksheet[notesCellAddress].s.alignment = { vertical: 'center', wrapText: true }; // <-- Added wrapText
            worksheet[notesCellAddress].s.border = borderStyle;
         } else {
            // If cell doesn't exist but should (e.g., empty note), create and style it
             worksheet[notesCellAddress] = { v: form.entries[i].notes || '', t: 's', s: { alignment: { vertical: 'center', wrapText: true }, border: borderStyle } };
         }

          // Apply vertical center alignment for other columns that don't have specific horizontal alignment
          [1, 7].forEach(colIndex => { // Column B and H (index 1 and 7) - note H now has wrapText too
               const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
               if (worksheet[cellAddress] && !worksheet[cellAddress].s) {
                  // Only apply if no other style object exists (shouldn't happen with checks above, but safety)
                  worksheet[cellAddress].s = {};
               }
                if (worksheet[cellAddress] && worksheet[cellAddress].s && !worksheet[cellAddress].s.alignment) {
                   worksheet[cellAddress].s.alignment = { vertical: 'center' };
                } else if (worksheet[cellAddress] && worksheet[cellAddress].s && worksheet[cellAddress].s.alignment) {
                   // Ensure vertical center is set if alignment object already exists
                   worksheet[cellAddress].s.alignment.vertical = 'center';
                }
                // Apply border style
                worksheet[cellAddress].s.border = borderStyle;
          });
   }


  // Apply borders to all cells in the worksheet, including merged cells
  const lastRowIndex = dataStartRowIndex + form.entries.length - 1;

  // First, ensure all regular cells have borders
  for (let r = 0; r <= lastRowIndex; r++) {
    for (let c = 0; c < numColumns; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });

      // Create the cell if it doesn't exist
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's', s: {} };
      }

      applyBorderStyle(cellAddress);
    }
  }

  // Then, ensure all merged cells have borders
  // For merged cells, we need to create cells if they don't exist
  if (worksheet['!merges']) {
    worksheet['!merges'].forEach(merge => {
      // Apply borders to all cells in the merged region
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        for (let c = merge.s.c; c <= merge.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });

          // Create the cell if it doesn't exist
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: '', t: 's', s: {} };
          }

          // Apply border style
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          worksheet[cellAddress].s.border = borderStyle;
        }
      }
    });
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '表单数据');

  // Generate Excel file
  const fileName = `${form.name || '表单'}_${form.branchCode}_${form.surveyDate}_${form.courierCode}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
