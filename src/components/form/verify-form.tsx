"use client"
import { useSearchParams } from 'next/navigation';

export default function VerifyAccount(){
    const searchParams = useSearchParams();

    console.log(searchParams.get('email'));
    return (
        <div>
            <h1>khj</h1>
        </div>
    );
};

