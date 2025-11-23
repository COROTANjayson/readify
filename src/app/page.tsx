import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquare, Upload, Zap } from "lucide-react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Text Content */}
          <div className="flex flex-col items-center justify-center text-center lg:flex-1 lg:items-start lg:text-left">
            <h1
              className="mx-auto lg:mx-0 max-w-4xl font-semibold leading-tight 
  text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground/90"
            >
              Instantly summarize and explore your{" "}
              <span className="bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent">
                documents
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-muted-foreground">
              SummarAIze helps you quickly understand any PDF — simply upload your document, and start exploring or
              asking questions in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                className={buttonVariants({
                  size: "lg",
                  className: "shadow-lg hover:shadow-xl transition-all",
                })}
                href="/dashboard"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "shadow-sm hover:shadow-md transition-all",
                })}
                href="#features"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Image - Shows below on mobile, right side on desktop */}
          <div className="mt-16 lg:mt-0 lg:flex-1">
            <div className="-m-2 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-2 ring-1 ring-inset ring-primary/10 lg:-m-4 lg:rounded-2xl lg:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <Image
                src="/dashboard-preview.jpg"
                alt="product preview"
                width={1364}
                height={866}
                quality={100}
                className="rounded-md bg-background p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-border/50"
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>


      <div id="features" className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Zap className="mr-2 h-4 w-4" />
              Quick Setup
            </div>
            <h2 className="mt-2 font-bold text-4xl text-foreground sm:text-5xl">Get started in minutes</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Summarizing and exploring your PDF files has never been simpler with SummarAIze.
            </p>
          </div>

          {/* Steps */}
          <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
            <li className="md:flex-1">
              <div className="flex flex-col space-y-2 border-l-4 border-primary/30 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pt-4 hover:border-primary transition-colors group">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    1
                  </div>
                  <span className="text-sm font-medium text-primary">Step 1</span>
                </div>
                <span className="text-xl font-semibold text-foreground">Sign up for an account</span>
                <span className="mt-2 text-muted-foreground">
                  Get started for free and experience effortless document summarization.
                </span>
              </div>
            </li>
            <li className="md:flex-1">
              <div className="flex flex-col space-y-2 border-l-4 border-primary/30 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pt-4 hover:border-primary transition-colors group">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-primary">Step 2</span>
                </div>
                <span className="text-xl font-semibold text-foreground">Upload your PDF file</span>
                <span className="mt-2 text-muted-foreground">
                  Your document will be ready to summarize and chat with in seconds.
                </span>
              </div>
            </li>
            <li className="md:flex-1">
              <div className="flex flex-col space-y-2 border-l-4 border-primary/30 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pt-4 hover:border-primary transition-colors group">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-primary">Step 3</span>
                </div>
                <span className="text-xl font-semibold text-foreground">Discover more in your PDFs</span>
                <span className="mt-2 text-muted-foreground">
                  Upload a document and uncover summaries, insights, and answers instantly.
                </span>
              </div>
            </li>
          </ol>

          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-2 ring-1 ring-inset ring-primary/10 lg:-m-4 lg:rounded-2xl lg:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <Image
                  src="/file-upload-preview.jpg"
                  alt="uploading preview"
                  width={1419}
                  height={732}
                  quality={100}
                  className="rounded-md bg-background p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-border/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
