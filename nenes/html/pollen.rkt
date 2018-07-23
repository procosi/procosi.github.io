#lang racket/base

(require pollen/decode)
(require pollen/tag)
(require txexpr)

(provide (all-defined-out))

(define (root . elements)
  (txexpr 'article empty (decode-elements elements #:txexpr-elements-proc decode-paragraphs)))

(define (title . elements)
  `(h1 ,@elements))

(define (subtitle . elements)
  `(p [[class "subtitle"]] ,@elements))

(define (link url . words)
  `(a [[href ,url]] ,@words))

(define (codeblock . elements)
  `(pre [[class "code"]] ,@elements))

(define (blockquote source . words)
  `(blockquote ,@words
               (footer ,source)))

(define (sidenote . elements)
  (let ([snid (number->string (random 10000000))])
    `(span (label ((for ,snid) (class "margin-toggle sidenote-number")))
           (input ((type "checkbox")
                   (id ,snid)
                   (class "margin-toggle")))
           (span ((class "sidenote"))
                 ,@elements)
           ))
  )

(define (marginnote . elements)
  (let ([mnid (number->string (random 10000000))])
    `(span (label ((for ,mnid) (class "margin-toggle"))
                  "⊕")
           (input ((type "checkbox")
                   (id ,mnid)
                   (class "margin-toggle")))
           (span ((class "marginnote"))
                 ,@elements)
           ))
  )

(define (newthought . elements)
  `(span [[class "newthought"]] ,@elements))

(define (sans . elements)
  `(p [[class "sans"]] ,@elements))

(define (epigraph . elements)
  `(div [[class "epigraph"]] ,@elements))

(define (image url . description)
  `(img [[src ,url][alt ,@description]]))

(define (figurefull . elements)
  `(figure [[class "fullwidth"]] ,@elements))

(define (time . elements)
  `(h3 ,@elements))

(define (voice source . words)
  `(blockquote ,@words
               (footer ,source)))
(define noise
  `(span [[class "noise"]] "[...]"))

(define (profile url . description)
  `(img [[src ,url][alt ,@description][class "profile"]]))

