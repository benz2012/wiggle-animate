const makeRoot = (real, imag) => ({ real, imag })

const evaluate = (x, A, B, C, D) => {
  const q0 = A * x
  const B1 = q0 + B
  const C2 = B1 * x + C
  return {
    Q: C2 * x + D,
    dQ: (q0 + B1) * x + C2,
    B1,
    C2,
  }
}

const qdrtc = (A, B, C) => {
  const b = -B / 2
  const q = b * b - A * C
  let X1 = 0
  let Y1 = 0
  let X2 = 0
  let Y2 = 0

  if (q < 0) {
    const X = b / A
    const Y = Math.sqrt(-q) / A
    X1 = X
    Y1 = Y
    X2 = X
    Y2 = -Y
  } else {
    Y1 = 0
    Y2 = 0
    const r = b + Math.sign(b) * Math.sqrt(q)
    if (r === 0) {
      X1 = C / A
      X2 = -C / A
    } else {
      X1 = C / r
      X2 = r / A
    }
  }
  return [
    makeRoot(X1, Y1),
    makeRoot(X2, Y2),
  ]
}

const getCubicRoots = (A, B, C, D) => {
  let X
  let a
  let b1
  let c2
  if (A === 0) {
    X = undefined
    a = B
    b1 = C
    c2 = D
  } else if (D === 0) {
    X = 0
    a = A
    b1 = B
    c2 = C
  } else {
    a = A
    X = -(B / A) / 3
    let evalInfo = evaluate(X, A, B, C, D)
    let q = evalInfo.Q
    let dq = evalInfo.dQ
    b1 = evalInfo.B1
    c2 = evalInfo.C2

    let t = q / A
    let r = Math.abs(t) ** (1 / 3)
    const s = Math.sign(t)
    t = -dq / A
    if (t > 0) {
      r = 1.324717957244746 * Math.max(r, Math.sqrt(t))
    }
    let x0 = X - s * r
    if (x0 !== X) {
      const den = 1 + (100 * Number.EPSILON)
      do {
        X = x0
        evalInfo = evaluate(X, A, B, C, D)
        q = evalInfo.Q
        dq = evalInfo.dQ
        b1 = evalInfo.B1
        c2 = evalInfo.C2
        x0 = (dq === 0 ? X : X - (q / dq) / den)
      } while (s * x0 > s * X)
      if (Math.abs(A) * X * X > Math.abs(D / X)) {
        c2 = -D / X
        b1 = (c2 - C) / X
      }
    }
  }
  const roots = []
  if (X !== undefined) {
    roots.push(makeRoot(X, 0))
  }
  const quadInfo = qdrtc(a, b1, c2)
  return roots.concat(quadInfo)
}

const cubic = (x, a, b, c, d) => (
  (a * (x ** 3)) + (b * (x ** 2)) + (c * x) + d
)

const bezierCurve = ({ x2, x3, y2, y3 }) => {
  /* x2, and x3 are the X values from the 2nd and 3rd points for a bezier
      definition. For this use case, they must be between 0 - 1.
  */
  if (x2 > 1 || x2 < 0 || x3 > 1 || x3 < 0) {
    throw Error('This bezier curve requires control values between 0 & 1')
  }

  // These constants were reduced from the Cubic Bézier curve definition, with
  // values of (0, 0) and (1, 1) used for p1 & p4 respectively
  const xA = 3 * x2 - 3 * x3 + 1
  const xB = -1 * 6 * x2 + 3 * x3
  const xC = 3 * x2

  const yA = 3 * y2 - 3 * y3 + 1
  const yB = -1 * 6 * y2 + 3 * y3
  const yC = 3 * y2
  const yD = 0

  const t = (x) => {
    const xD = -x
    const roots = getCubicRoots(xA, xB, xC, xD)
    roots.filter(r => (
      r.imag === 0 &&
      r.real.toFixed(10) >= 0 &&
      r.real.toFixed(10) <= 1 &&
      !Object.is(r.real, -0)
    ))
    return roots[0].real
  }

  const y = (x) => {
    const time = t(x)
    return cubic(time, yA, yB, yC, yD)
  }

  return ({ t, y })
}

export default bezierCurve
