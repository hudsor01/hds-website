export function FormHeader() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex flex-center w-12 h-12 bg-primary/80/20 rounded-full mb-heading">
        <div className="w-6 h-6 bg-accent rounded-xs"></div>
      </div>
      <h2 className="text-3xl font-bold text-primary-foreground mb-3">
        Let&apos;s Build Something Amazing
      </h2>
      <p className="text-muted text-lg leading-relaxed container-narrow">
        Ready to transform your ideas into reality? Share your vision with us.
      </p>
    </div>
  )
}