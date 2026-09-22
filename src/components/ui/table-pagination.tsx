import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "./pagination";

export default function TablePagination(){
    return <Pagination>
        <PaginationContent>
            <PaginationItem>
                <PaginationLink>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink>3</PaginationLink>
            </PaginationItem>
        </PaginationContent>
    </Pagination>
}