'use client'

import { useCallback, useEffect, useState } from "react";
import BudgetDropdown from "../../components/BudgetDropdown/BudgetDropdown";
import "./budgets.css"
import BudgetProgressCard from "../../components/BudgetProgressCard/BudgetProgressCard";
import BudgetCard from "../../components/BudgetCard/BudgetCard";

export default function Budgets() {
    return (
        <div className="budgets-page">

            <h4 className="welcome-text">Welcome User</h4>

            <div className="top-part">
                <h1 className="main-header">Manage Your Budgets</h1>
                <BudgetDropdown />
            </div>

            <div className="bottom-part pt-4">
                <button className="btn btn-info add-account-button">
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
            </div>

            <BudgetProgressCard />

            <div id="infinite-loop" data-carousel='{ "loadingClasses": "opacity-0", "isInfiniteLoop": true }' className="group relative w-full">
                <div className="carousel h-80">
                    <div className="carousel-body h-full opacity-0">
                        {/* Slide 1 */}
                        <div className="carousel-slide">
                            <div className="flex justify-center p-2">
                                <BudgetCard/>
                                <BudgetCard/>
                                <BudgetCard/>
                            </div>
                             <div className="flex justify-center p-2">
                                <BudgetCard/>
                                <BudgetCard/>
                                <BudgetCard/>
                            </div>
                        </div>
                        {/* Slide 2 */}
                        <div className="carousel-slide">
                            <div className="flex h-full justify-center p-6">
                                <span className="self-center text-2xl sm:text-4xl">Second slide</span>
                            </div>
                        </div>
                        {/* Slide 3 */}
                        <div className="carousel-slide">
                            <div className="flex h-full justify-center p-6">
                                <span className="self-center text-2xl sm:text-4xl">Third slide</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Previous Slide */}
                <button type="button" className="carousel-prev start-5 max-sm:start-3 carousel-disabled:opacity-50 size-9.5 bg-transparent flex items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100">
                    <span className="icon-[tabler--chevron-left] size-5 cursor-pointer"></span>
                    <span className="sr-only">Previous</span>
                </button>
                {/* Next Slide */}
                <button type="button" className="carousel-next end-5 max-sm:end-3 carousel-disabled:opacity-50 size-9.5 bg-transparent flex items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100">
                    <span className="icon-[tabler--chevron-right] size-5"></span>
                    <span className="sr-only">Next</span>
                </button>
            </div>
        </div>
    );
}