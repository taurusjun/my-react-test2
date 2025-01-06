import React from "react";
import CommonLayout from "../../layouts/CommonLayout";
import FileCorrectionList from "../components/FileCorrectionList";
import CommonBreadcrumbs from "../../components/CommonBreadcrumbs";
import { getBreadcrumbPaths } from "../../config/breadcrumbPaths";

const FileCorrectionListPage = () => {
  const breadcrumbPaths = getBreadcrumbPaths();

  return (
    <CommonLayout
      currentPage="待校正文件列表"
      maxWidth="lg"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => (
        <CommonBreadcrumbs paths={breadcrumbPaths.fileCorrectionList} />
      )}
    >
      <FileCorrectionList />
    </CommonLayout>
  );
};

export default FileCorrectionListPage;
