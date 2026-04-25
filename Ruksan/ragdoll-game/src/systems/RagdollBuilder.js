import Phaser from 'phaser';

/*
 * Collision categories used across the game:
 *   1  = ground / platforms (static)
 *   2  = player body parts
 *   4  = enemy body parts
 *   8  = player arrows
 *  16  = enemy arrows
 *  32  = fruits / apples
 */

export default class RagdollBuilder {

  /**
   * Build a complete stickman ragdoll at (x, y).
   * Returns an object with: parts, constraints, anchors, helmet info.
   */
  static build(scene, x, y, opts = {}) {
    const {
      isPlayer   = false,
      hasHelmet  = false,
      helmetIdx  = 1,
      s          = 1.5,
    } = opts;

    const bodyCat   = isPlayer ? 2 : 4;
    const arrowCat  = isPlayer ? 16 : 8;   // arrows that CAN hit me
    const collMask  = [1, arrowCat];        // ground + opponent arrows

    // ── helper: create a physics-enabled image ──
    const make = (bx, by, tex, w, h, isCircle = false) => {
      const img = scene.matter.add.image(bx, by, tex);
      img.setDisplaySize(w, h);
      if (isCircle) img.setCircle(w / 2);
      else          img.setRectangle(w, h);
      img.setFriction(0.4);
      img.setFrictionAir(0.05);
      img.setBounce(0.05);
      img.setCollisionCategory(bodyCat);
      img.setCollidesWith(collMask);
      img.setData('owner', isPlayer ? 'player' : 'enemy');
      img.setDepth(3);
      return img;
    };

    // ── Create body parts ──
    const head    = make(x,       y - 52*s, 'head',     32*s, 32*s, true);
    const torso   = make(x,       y - 20*s, 'torso',    22*s, 40*s);
    const uArmL   = make(x - 14*s,  y - 32*s, 'upperArm',  8*s, 24*s);
    const uArmR   = make(x + 14*s,  y - 32*s, 'upperArm',  8*s, 24*s);
    const fArmL   = make(x - 14*s,  y - 10*s, 'forearm',   7*s, 22*s);
    const fArmR   = make(x + 14*s,  y - 10*s, 'forearm',   7*s, 22*s);
    const thighL  = make(x - 7*s,   y + 10*s, 'thigh',     9*s, 26*s);
    const thighR  = make(x + 7*s,   y + 10*s, 'thigh',     9*s, 26*s);
    const shinL   = make(x - 7*s,   y + 34*s, 'shin',     10*s, 26*s);
    const shinR   = make(x + 7*s,   y + 34*s, 'shin',     10*s, 26*s);

    // Zone labels for hit detection
    head.setData('zone', 'head');
    torso.setData('zone', 'body');
    [uArmL, uArmR, fArmL, fArmR].forEach(b => b.setData('zone', 'arm'));
    [thighL, thighR, shinL, shinR].forEach(b => b.setData('zone', 'leg'));

    const allBodies = [head, torso, uArmL, uArmR, fArmL, fArmR, thighL, thighR, shinL, shinR];

    // ── Joint helper ──
    const joint = (a, b, pA, pB, stiff = 0.9, len = 0) =>
      scene.matter.add.constraint(a.body, b.body, len, stiff, {
        pointA: pA, pointB: pB,
      });

    const constraints = [
      // neck
      joint(head,  torso,  { x: 0, y: 14*s },  { x: 0, y: -18*s }, 1),
      // shoulders
      joint(torso, uArmL, { x: -10*s, y: -16*s }, { x: 0, y: -10*s }, 1),
      joint(torso, uArmR, { x: 10*s, y: -16*s },  { x: 0, y: -10*s }, 1),
      // elbows
      joint(uArmL, fArmL, { x: 0, y: 10*s },  { x: 0, y: -9*s }, 1),
      joint(uArmR, fArmR, { x: 0, y: 10*s },  { x: 0, y: -9*s }, 1),
      // hips
      joint(torso, thighL, { x: -6*s, y: 18*s }, { x: 0, y: -11*s }, 1),
      joint(torso, thighR, { x: 6*s, y: 18*s },  { x: 0, y: -11*s }, 1),
      // knees
      joint(thighL, shinL, { x: 0, y: 11*s },  { x: 0, y: -11*s }, 1),
      joint(thighR, shinR, { x: 0, y: 11*s },  { x: 0, y: -11*s }, 1),
    ];

    // ── Foot anchors (static invisible bodies pinned to ground) ──
    const footY = y + 46*s;
    const anchorL = scene.matter.add.rectangle(x - 10*s, footY, 2, 2, { isStatic: true });
    const anchorR = scene.matter.add.rectangle(x + 10*s, footY, 2, 2, { isStatic: true });

    const footPinL = scene.matter.add.constraint(shinL.body, anchorL, 0, 0.85, {
      pointA: { x: 0, y: 11*s }, pointB: { x: 0, y: 0 },
    });
    const footPinR = scene.matter.add.constraint(shinR.body, anchorR, 0, 0.85, {
      pointA: { x: 0, y: 11*s }, pointB: { x: 0, y: 0 },
    });

    // ── Spine rod: keeps torso upright above feet ──
    torso.setFixedRotation();
    head.setFixedRotation();

    const spinePin = scene.matter.add.constraint(torso.body, anchorL, 66*s, 1, {
      pointA: { x: 0, y: 0 }, pointB: { x: 10*s, y: 0 },
    });

    // ── Helmet ──
    let helmet = null, helmetPin = null;
    if (hasHelmet) {
      helmet = make(x, y - 66*s, `helmet${helmetIdx}`, 28*s, 28*s);
      helmet.setFriction(0.2);
      helmet.setBounce(0.5);
      helmet.setData('zone', 'helmet');
      helmetPin = scene.matter.add.constraint(
        head.body, helmet.body, 0, 0.95,
        { pointA: { x: 0, y: -10*s }, pointB: { x: 0, y: 6*s } }
      );
    }

    return {
      parts: { head, torso, uArmL, uArmR, fArmL, fArmR, thighL, thighR, shinL, shinR },
      allBodies,
      constraints,
      footPinL, footPinR, spinePin,
      anchorL, anchorR,
      helmet, helmetPin,
    };
  }

  /* ── Make the ragdoll go limp (on death) ── */
  static flop(scene, rag) {
    // release feet
    const rem = c => { try { scene.matter.world.removeConstraint(c); } catch (_) {} };
    rem(rag.footPinL);
    rem(rag.footPinR);
    rem(rag.spinePin);

    // unlock rotation
    try { rag.parts.torso.setFixedRotation(false); } catch (_) {}
    try { rag.parts.head.setFixedRotation(false); } catch (_) {}

    // loosen all joints
    rag.constraints.forEach(c => { try { c.stiffness = 0.03; } catch (_) {} });

    // small impulse
    try {
      const t = rag.parts.torso;
      scene.matter.applyForce(t.body, t.body.position, {
        x: (Math.random() - 0.5) * 0.06,
        y: -0.04,
      });
    } catch (_) {}
  }

  /* ── Destroy all physics bodies ── */
  static destroy(scene, rag) {
    const rem = c => { try { scene.matter.world.removeConstraint(c); } catch (_) {} };
    rem(rag.footPinL);
    rem(rag.footPinR);
    rem(rag.spinePin);
    if (rag.helmetPin) rem(rag.helmetPin);
    rag.constraints.forEach(rem);

    rag.allBodies.forEach(b => { try { b.destroy(); } catch (_) {} });
    if (rag.helmet) { try { rag.helmet.destroy(); } catch (_) {} }
    try { scene.matter.world.remove(rag.anchorL); } catch (_) {}
    try { scene.matter.world.remove(rag.anchorR); } catch (_) {}
  }
}
