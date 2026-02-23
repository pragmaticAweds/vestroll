import { contractMetricsData } from "@/constants";

export default function ContractMetrics() {
  return (
    <div className="flex w-full gap-4 mb-4 overflow-x-auto max-w-screen sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:overflow-x-visible">
      {contractMetricsData.map((metric) => (
        <div key={metric.title} className="w-full min-w-3xs">
          <div className="h-full p-4 bg-white rounded-lg min-w-60 lg:w-full dark:bg-gray-900">
            <span className="flex justify-between text-xs font-medium">
              <p className="text-text-subtext dark:text-gray-400">
                {metric.title}
              </p>
              <p className="text-[#7F8C9F] dark:text-gray-500">This year</p>
            </span>
            <hr className="my-4 text-border-primary dark:border-gray-800" />
            <div className="flex items-center justify-between">
              <span>
                <p className="mb-1 text-2xl font-bold text-text-header lg:tracking-tight lg:text-3xl dark:text-white">
                  {metric.value}
                </p>
                <p className="text-sm font-medium text-[#7F8C9F] dark:text-gray-400">
                  {metric.subValue}
                </p>
              </span>
              <span className="text-primary-500">{metric.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
