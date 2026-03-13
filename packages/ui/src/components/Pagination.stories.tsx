import * as React from "react";
import type { Meta } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta = { title: "Navigation/Pagination" };
export default meta;

export const Default = () => {
  const [page, setPage] = React.useState(1);
  return <div className="p-4"><Pagination currentPage={page} totalPages={20} onPageChange={setPage} /></div>;
};

export const FewPages = () => {
  const [page, setPage] = React.useState(1);
  return <div className="p-4"><Pagination currentPage={page} totalPages={5} onPageChange={setPage} /></div>;
};
