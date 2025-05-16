'use server';

import * as XLSX from 'xlsx-js-style';
import { Form } from '../types';

const borderStyle = {
  top: { style: "thin" },
  bottom: { style: "thin"},
  left: { style: "thin" },
  right: { style: "thin"}
};

/**
 * Server action to export form data to Excel
 * This is used as a fallback when client-side export fails
 */
export async function exportFormToExcelServer(formData: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // Parse the form data
    const form: Form = JSON.parse(formData);
    
    // Define the column headers for the main data table
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
      ['1、跟随小哥收派工作，逐票客观记录小哥末端作业真实情况，不允许干扰小哥正常工作流程及操作，避免影响真实性。\n2、 请与小哥提前知会：该记录数据仅用于内部标准优化数据支撑，运单统计结果匿名制，且不作为标准优化之外的公开或第三方使用（比如考核监控等）。\n3、其他说明：妥投地址"三方"：菜鸟驿站、超市、合作点、丰巢等'],

      // Row 3: City Name (Label in Col A, Value in Col B)
      ['城市名称', '', form.cityName],

      // Row 4: Survey Date (Label in Col A, Value in Col B), Area Type (Label in Col C, Value in Col D)
      ['调研时间', '', form.surveyDate, '', '区域类型\n(工业区/住宅区等)', form.areaType],

      // Row 5: Branch Code (Label in Col A, Value in Col B), Courier Code (Label in Col C, Value in Col D)
      ['网点代码', '', form.branchCode, '', '小哥工号', form.courierCode],

      // Row 6: Header for mandatory options ("以下选项必选 ✓✗")
      // This header spans the columns related to the options below it (Cols C to G)
      ['序号', '运单号后4\n位',  '以下选项必选 "✓✗"', '', '', '','','备注\n（滞留 "z"）'], // This cell will be placed in column C (index 2) by the merge

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
      { s: { r: 3, c: 5 }, e: { r: 3, c: numColumns - 1 } },

      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
      { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: numColumns - 1 } },
      // Row 6: "以下选项必选" header - merge from column C (index 2) to column G (index 6)
      { s: { r: 5, c: 2 }, e: { r: 5, c: numColumns - 2 } },
      // Row 6: First two columns and last column
      { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 5, c: numColumns - 1 }, e: { r: 6, c: numColumns - 1 } },
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

    // Set row heights
    const rowHeights = [
      { hpt: 20 },  // Row 1: Title row
      { hpt: 100 }, // Row 2: Instructions row (needs wrapText style too)
      { hpt: 24 },  // Row 3: City name row
      { hpt: 34 },  // Row 4: Survey date/area type row
      { hpt: 24 },  // Row 5: Branch/courier code row
      { hpt: 18 },  // Row 6: "以下选项" header row
      { hpt: 32 },  // Row 7: Main table header row
    ];
    worksheet['!rows'] = rowHeights;

    // Apply styling (simplified for server action)
    applyStyles(worksheet, form, numColumns);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '表单数据');

    // Generate Excel file as binary string
    const excelData = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    return {
      success: true,
      data: excelData
    };
  } catch (error) {
    console.error('Server-side Excel export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during export'
    };
  }
}

// Helper function to apply styles to the worksheet
function applyStyles(worksheet: XLSX.WorkSheet, form: Form, numColumns: number) {
  // Apply basic styling to all cells
  const lastRowIndex = 7 + form.entries.length - 1;
  
  for (let r = 0; r <= lastRowIndex; r++) {
    for (let c = 0; c < numColumns; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      
      // Create the cell if it doesn't exist
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's', s: {} };
      }
      
      // Apply border style
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.border = borderStyle;
      
      // Apply alignment based on cell position
      if (r === 0) { // Title row
        worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
        worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', bold: true, sz: 14 };
        worksheet[cellAddress].s.fill = { fgColor: { rgb: "C5D9F1" } };
      } else if (r === 1) { // Instructions row
        worksheet[cellAddress].s.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
        worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', sz: 12 };
      } else if (r === 6) { // Table header row
        worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        worksheet[cellAddress].s.font = { name: 'Microsoft YaHei', bold: true };
      } else if (r >= 7) { // Data rows
        worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
      }
    }
  }
}
