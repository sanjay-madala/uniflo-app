import CSATSurveyClient from "./CSATSurveyClient";

export function generateStaticParams() {
  return [
    { surveyToken: "survey_001" },
    { surveyToken: "survey_002" },
    { surveyToken: "survey_003" },
    { surveyToken: "survey_004" },
  ];
}

export default function CSATSurveyPage() {
  return <CSATSurveyClient />;
}
