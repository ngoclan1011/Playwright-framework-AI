import * as allure from 'allure-js-commons';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export interface TestMeta {
  /** Mã test case để truy vết sang tài liệu manual / RTM */
  id: string;
  description: string;
  severity: Severity;
  feature: string;
}

/** Khai đủ metadata bắt buộc (reporting_rules.md mục 1). Tags khai bằng option `tag` của Playwright */
export async function meta({ id, description, severity, feature }: TestMeta): Promise<void> {
  await allure.label('testId', id);
  await allure.description(description);
  await allure.severity(severity);
  await allure.feature(feature);
}
