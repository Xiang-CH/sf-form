export interface FormMetadata {
  id: string;
  name: string;
  cityName: string; // 城市名
  surveyDate: string; // 调研时间
  branchCode: string; // 网点代码
  areaType: string; // 区域类型
  courierCode: string; // 小哥工号
  createdAt: string;
  updatedAt: string;
}

export interface FormEntry {
  id: string;
  trackingNumberLastFour: string; // 运单号后四位
  addressDelivered: boolean; // 地址妥投
  thirdPartyDelivery: boolean; // 派送至三方
  customerInteraction: boolean; // 客户交互
  customerInteractionSending: boolean; // 客户交互（寄件）
  customerInteractionReturn: boolean; // 客户交互（电退）
  notes: string; // 备注
  createdAt: string;
}

export interface Form extends FormMetadata {
  entries: FormEntry[];
}
