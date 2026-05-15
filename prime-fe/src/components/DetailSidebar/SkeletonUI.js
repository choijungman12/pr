import React from "react";

function SkeletonUI() {
  return (
    <div>
      <div>
        <div className="h-[220px] w-full bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
              <div>
                <span className="block h-3 w-16 bg-gray-200 animate-pulse rounded"></span>
                <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="block h-4 w-24 bg-gray-200 animate-pulse rounded"></span>
              <div className="mt-2 h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonUI;