import { buttonVariants } from "@/components/ui/button"; // Import shadcn's button styles
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DoctorReviewSheet() {
  return (
    <Sheet>
      {/*  FIX: Remove <Button> and use buttonVariants class directly on SheetTrigger */}
      <SheetTrigger className={buttonVariants({ variant: "outline" })}>
        Review Doctor
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>This action cannot be undone.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
