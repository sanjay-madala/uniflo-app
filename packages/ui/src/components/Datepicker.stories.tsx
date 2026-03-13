import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Datepicker, DateRangePicker } from "./Datepicker";

const meta: Meta = {
  title: "Inputs/Datepicker",
};
export default meta;

export const SingleDate = () => {
  const [date, setDate] = React.useState<Date | undefined>();
  return <div className="p-4"><Datepicker label="Due date" value={date} onChange={setDate} /></div>;
};

export const DateRange = () => {
  const [range, setRange] = React.useState<{ start?: Date; end?: Date }>({});
  return <div className="p-4"><DateRangePicker label="Date range" startDate={range.start} endDate={range.end} onChange={setRange} /></div>;
};
